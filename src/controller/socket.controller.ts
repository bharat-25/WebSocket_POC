import { Server, Socket } from "socket.io";
import { UserModel } from "../model/user.model";
import ChatModel from "../model/chat.model";
import { Message } from "kafkajs";
import { producer } from "../integrations/producer/kafka/producer.service";
import { PushNotificationService } from "../service/fcm/push-notification";
import { KafkaManager } from "../integrations/consumer/kafka";
import { consumer } from "../integrations/consumer/consumer.service";
import { SocketData } from "../interface/socket.interface";



class SocketHandler {
  /**
   * Object to map user mobile numbers to socket IDs, track online status of users..
   * Instance of KafkaManager for Kafka integration.
   */
  private socketIdByUserMobile: Record<string, string> = {};
  private onlineUsers: Record<string, boolean> = {};
  private kafka: KafkaManager;

  constructor(private io: Server) {
    this.kafka = new KafkaManager();
    this.init();
  }

   /**
   * Initializes socket connection.
   */
  private init(): void {
    this.io.on("connection", (socket: Socket & { data: SocketData }) => {
      this.handleConnection(socket);
    });
  }


  /**
   * Handles new socket connection.
   */
  private async handleConnection(socket: Socket & { data: SocketData }): Promise<void> {
    console.log("User connected with socket ID", socket.id);

    socket.on("new-user-connect", (data: SocketData) => this.handleUserConnect(socket, data));
    socket.on("disconnect", () => this.handleDisconnect(socket));
    socket.on("private-chat", async ({ message }: { message: string }) => await this.handlePrivateChat(socket, message));
    socket.on("typing", (data: SocketData) => this.handleTyping(data));
    socket.on("stopTyping", (data: SocketData) => this.handleStopTyping(data));
  }

  /**
   * Handles new user connection.
   */
  private async handleUserConnect(socket: Socket & { data: SocketData }, data: SocketData): Promise<void> {
    const { senderMobileNo } = data;
    socket.data = data;
    this.socketIdByUserMobile[senderMobileNo] = socket.id;
    this.onlineUsers[senderMobileNo] = true;
    console.log(`User with mobile number ${senderMobileNo} is connected with socket ID ${socket.id}`);
    
    // Check for any pending messages for this user and send push notifications
    // this.sendPendingMessages(senderMobileNo);
  }

  /**
   * Handles socket disconnect.
   */
  private handleDisconnect(socket: Socket & { data: SocketData }): void {
    const userMobile = Object.entries(this.socketIdByUserMobile).find(([_, id]) => id === socket.id)?.[0];
    if (userMobile) {
      delete this.socketIdByUserMobile[userMobile];
      delete this.onlineUsers[userMobile];
      console.log(`User with mobile number ${userMobile} disconnected`);
    }
  }

  /**
   * Handles private chat between users.
   */
    private async handlePrivateChat(socket: Socket & { data: SocketData }, message: string): Promise<void> {
      try {
          console.log("----------INSIDE PRIVATE CHAT-------------------");
          const { senderMobileNo, receiverMobileNo } = socket.data;
          const [senderUser, receiverUser] = await Promise.all([
              UserModel.findOne({ phone_number: senderMobileNo }),
              UserModel.findOne({ phone_number: receiverMobileNo }),
          ]);
  
          if (!senderUser || !receiverUser) {
              console.error("User not found");
              return;
          }
  
          const chat = await ChatModel.create({
              senderId: senderUser.id,
              receiverId: receiverUser ? receiverUser.id : null,
              message,
          });
  
          const pendingMsgData = {
              senderId: senderUser.id,
              receiverId: receiverUser.id,
              message,
          };
  
          const messageData = {
              senderName: senderUser.name.toString(),
              receiverName: receiverUser ? receiverUser.name.toString() : null,
              message,
          };
  
          const kafkaMessage: Message = { value: JSON.stringify(messageData) };
  
          console.log(kafkaMessage);
  
          await producer.produce("KAFKA-TOPIC-PRODUCER", kafkaMessage);
  
          console.log(
              `${messageData.senderName} sending to ${messageData.receiverName} MESSAGE:`,
              message
          );
  
          if (receiverUser) {
              console.log("---------INSIDE IF RECEIVER_USER--------------");
              const receiverSocketId = this.socketIdByUserMobile[receiverMobileNo];
  
              if (receiverSocketId) {
                  console.log("--------------INSIDE IF receiverSocketId-----------------");
                  await this.kafka.connectToAdmin();
                  await this.kafka.createTopics();
                  await this.kafka.disconnectFromAdmin();
                  await consumer.initiateConsumer();
  
                  this.io.to(receiverSocketId).emit("private-chat", messageData);
              } else {
                  console.log("------------OFFLINE RECEIVER-------------------");
  
                  // Receiver is offline, save the message as pending
                  await this.savePendingMessage(pendingMsgData);
              }
          } else {
              console.log("RECEIVER NOT FOUND");
  
              // Receiver not found, save the message as pending
              await this.savePendingMessage(pendingMsgData);
          }
      } catch (error) {
          console.error("Error processing private chat:", error);
      }
  }
  
/**
   * Handles typing event.
   */
  private handleTyping(data: SocketData): void {
    const receiverSocketId = this.socketIdByUserMobile[data.receiverMobileNo];
    if (receiverSocketId) {
      this.io.to(receiverSocketId).emit("typing", data);
    }
  }

 /**
   * Handles stop typing event.
   */
  private handleStopTyping(data: SocketData): void {
    const receiverSocketId = this.socketIdByUserMobile[data.receiverMobileNo];
    if (receiverSocketId) {
      this.io.to(receiverSocketId).emit("stopTyping", data);
    }
  }

/**
   * Saves pending message to the database.
   */
  private async savePendingMessage(pendingMsgData: {
    senderId?: any;
    receiverId?: any;
    message: any;
    senderMobileNo?: any;
    receiverMobileNo?: any;
  }): Promise<void> {
    try {
      console.log(pendingMsgData);
      console.log("-----------SavePendingMessage---------------");

      // Save the message as pending in the database
      const chat = await ChatModel.create({
        senderId: pendingMsgData.senderId,
        receiverId: pendingMsgData.receiverId,
        message: pendingMsgData.message,
        delivered: false, // Mark the message as not delivered
      });
      console.log("Message saved as pending:", chat);
    } catch (error) {
      console.log("SavePendingMessage ERRORRRRRRRRRRRRRRRRRRRRR");

      console.error("Error saving pending message:", error);
      throw error;
    }
  }

  /**
   * Sends pending messages to a user.
   */
  private async sendPendingMessages(receiverMobileNo: string): Promise<void> {
    try {
      const pendingMessages = await this.getPendingMessages(receiverMobileNo);

      // Get an instance of PushNotificationService
      const pushNotificationService = PushNotificationService.getInstance();

      // Send push notifications for pending messages
      for (const messageData of pendingMessages) {
        await pushNotificationService.sendPushNotification(
          messageData.receiverMobileNo,
          { title: "New Message", body: messageData.message }
        );

        // Update the message as delivered
        await ChatModel.updateOne(
          { _id: messageData._id },
          { $set: { delivered: true } }
        );
        console.log(
          "Push notification sent and message marked as delivered:",
          messageData
        );
      }
    } catch (error) {
      console.error("Error sending pending messages:", error);
      // throw error;
    }
  }

  /**
   * Retrieves pending messages for a user.
   */
  private async getPendingMessages(receiverMobileNo: string): Promise<any> {
    try {
      console.log("---------->inside try----------->");
      // const pendingMessages = await ChatModel.find({ receiverMobileNo, delivered: false });
      this.kafka = new KafkaManager();
      await this.kafka.connectToAdmin();
      await this.kafka.createTopics();
      await this.kafka.disconnectFromAdmin();
      const consumerData = await consumer.initiateConsumer();
      console.log("CONSUMER_DATA---------", consumerData);
    } catch (error) {
      console.error("Error retrieving pending messages:", error);
      throw error;
    }
  }
}


/**
 * Handles socket connection events.
 */
export const handleSocketConnection = (io: Server) => {
  new SocketHandler(io);
};