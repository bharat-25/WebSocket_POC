import { Server, Socket } from "socket.io";
import { UserModel } from "../model/user.model";
import ChatModel from "../model/chat.model";
import { Message } from "kafkajs";
import { producer } from "../integrations/producer/kafka/producer.service";
import {PushNotificationService} from '../service/fcm/push-notification';
import { KafkaManager } from "../integrations/consumer/kafka";
import { consumer } from "../integrations/consumer/consumer.service";

let kafka!:KafkaManager

interface SocketData {
  senderMobileNo: string;
  receiverMobileNo: string;
}

export const handleSocketConnection = (io: Server) => {
  const socketIdByUserMobile: Record<string, string> = {};
  const onlineUsers: Record<string, boolean> = {};

  io.on("connection", (socket: Socket & { data: SocketData }) => {
    console.log("User connected with socket ID", socket.id);

    const handleUserConnect = (data: SocketData) => {
      const { senderMobileNo } = data;
      socket.data = data;
      socketIdByUserMobile[senderMobileNo] = socket.id;
      onlineUsers[senderMobileNo] = true;
      console.log(`User with mobile number ${senderMobileNo} is connected with socket ID ${socket.id}`);
    
      // Check for any pending messages for this user and send push notifications
      sendPendingMessages(senderMobileNo);
    };

    const handleDisconnect = () => {
      const userMobile = Object.entries(socketIdByUserMobile).find(([_, id]) => id === socket.id)?.[0];
      if (userMobile) {
        delete socketIdByUserMobile[userMobile];
        delete onlineUsers[userMobile];
        console.log(`User with mobile number ${userMobile} disconnected`);
      }
    };

    socket.on("new-user-connect", handleUserConnect);

    socket.on("disconnect", handleDisconnect);

    socket.on("private-chat", async ({ message }: { message: string }) => {
      try {
        const { senderMobileNo, receiverMobileNo } = socket.data;
        const [senderUser, receiverUser] = await Promise.all([
          UserModel.findOne({ phone_number: senderMobileNo }),
          UserModel.findOne({ phone_number: receiverMobileNo })
        ]);

        if (!senderUser || !receiverUser) {
          console.error("User not found");
          return;
        }

        const chat = await ChatModel.create({
          senderId: senderUser.id,
          receiverId:  receiverUser ? receiverUser.id : null,
          message,
        });

        const messageData = { senderName: senderUser.name.toString(), receiverName: receiverUser ? receiverUser.name.toString() : null, message };
        const kafkaMessage: Message = {
          value: JSON.stringify(messageData),
        };

        await producer.produce("KAFKA-TOPIC-PRODUCER", kafkaMessage);

        console.log(`${messageData.senderName} sending to ${messageData.receiverName} MESSAGE:`, message);
        
        
        if (receiverUser) {
          const receiverSocketId = socketIdByUserMobile[receiverMobileNo];
          if (receiverSocketId) {
            io.to(receiverSocketId).emit("private-chat", messageData);
          } else {
            // Receiver is offline, save the message as pending
            savePendingMessage(receiverMobileNo, messageData);
          }
        } else {
          // Receiver not found, save the message as pending
          savePendingMessage(receiverMobileNo, messageData);
        }
      } catch (error) {
        console.error("Error processing private chat:", error);
      }
    });
    //       const messageData = { senderName: senderUser.name.toString(), receiverName: receiverUser.name.toString(), message };
    //       const kafkaMessage: Message = {
    //         value: JSON.stringify(messageData),
    //       };

    //       console.log(`${messageData.senderName} sending to ${messageData.receiverName} MESSAGE:`, message);

    //       await producer.produce("KAFKA-TOPIC-PRODUCER", kafkaMessage);

    //       io.to(receiverSocketId).emit("private-chat", messageData);

    //       let fcmToken="fghsfdHGfhgscfghfhgGCFhkHJDGJhvcdbNS"

    //       // Get an instance of PushNotificationService
    //       const pushNotificationService = PushNotificationService.getInstance();

    //       // Call the sendPushNotification method on the instance
    //       await pushNotificationService.sendPushNotification(fcmToken, { title: "New Message", body: message });

    //     } else {

    //       console.log(`Receiver's socket ID not found for mobile number: ${receiverMobileNo}`);
    //     }
    //   } catch (error) {
    //     console.error("Error processing private chat:", error);
    //   }
    // });

    const handleTyping = (data: SocketData) => {
      const receiverSocketId = socketIdByUserMobile[data.receiverMobileNo];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", data);
      }
    };

    const handleStopTyping = (data: SocketData) => {
      const receiverSocketId = socketIdByUserMobile[data.receiverMobileNo];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("stopTyping", data);
      }
    };

    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
  });
};

async function savePendingMessage(receiverMobileNo: string, messageData: any) {
  try {
    // Save the message as pending in the database
    const chat = await ChatModel.create({
      senderMobileNo: messageData.senderMobileNo,
      receiverMobileNo: receiverMobileNo,
      message: messageData.message,
      delivered: false // Mark the message as not delivered
    });
    console.log("Message saved as pending:", chat);
  } catch (error) {
    console.error("Error saving pending message:", error);
    throw error;
  }
}

async function sendPendingMessages(receiverMobileNo: string) {
  try {
    // Retrieve pending messages for the receiverMobileNo from the database
    const pendingMessages = await getPendingMessages(receiverMobileNo);

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
      console.log("Push notification sent and message marked as delivered:", messageData);
    }
  } catch (error) {
    console.error("Error sending pending messages:", error);
    throw error;
  }
}

async function getPendingMessages(receiverMobileNo: string): Promise<any> {
  try {
    console.log("---------->inside try----------->")
    // Retrieve pending messages for the receiverMobileNo from the database
    // Example implementation using ChatModel
    // const pendingMessages = await ChatModel.find({ receiverMobileNo, delivered: false });
    this.kafka = new KafkaManager();
     await kafka.connectToAdmin();
     await kafka.createTopics();
     await kafka.disconnectFromAdmin();
     consumer.initiateConsumer();
  } catch (error) {
    console.error("Error retrieving pending messages:", error);
    throw error;
  }
}









































// import { Server, Socket } from "socket.io";
// import { UserModel } from "../model/user.model";
// import ChatModel from "../model/chat.model";

// interface SocketData {
//   senderMobileNo?: string;
//   receiverMobileNo?: string;
// }

// export const handleSocketConnection = (io: Server) => {
//   const socketIdByUserMobile: { [mobile: string]: string } = {};
//   const onlineUsers: { [mobile: string]: boolean } = {};

//   // Socket is connected
//   io.on("connection", (socket: Socket & { data: SocketData }) => {
//     console.log("User connected with socket ID", socket.id);

//     socket.on("new-user-connect", (data: SocketData) => {
//       socket.data = data;
//       socketIdByUserMobile[data.senderMobileNo!] = socket.id;
//       onlineUsers[data.senderMobileNo!] = true; // Mark user as online
//       console.log(`User with mobile number ${data.senderMobileNo} is connected with socket ID ${socket.id}`);
    
//     });

//     socket.on("disconnect", () => {
//       const userMobile = Object.keys(socketIdByUserMobile).find(mobile => socketIdByUserMobile[mobile] === socket.id);
//       if (userMobile) {
//         delete socketIdByUserMobile[userMobile];
//         delete onlineUsers[userMobile]; // Mark user as offline
//         console.log(`User with mobile number ${userMobile} disconnected`);
//       }
//     });

//     // Listen for private-chat event
//     socket.on("private-chat", async ({ message }: { message: string }) => {
//       try {
//         const { senderMobileNo, receiverMobileNo } = socket.data;
//         const [senderUser, receiverUser] = await Promise.all([
//           UserModel.findOne({ phone_number: senderMobileNo }),
//           UserModel.findOne({ phone_number: receiverMobileNo })
//         ]);
//         // const receiverUser = await UserModel.findOne({ phone_number: socket.data.receiverMobileNo });
//         // const senderUser = await UserModel.findOne({ phone_number: socket.data.senderMobileNo });

//         if ( !senderUser || !receiverUser) {
//           console.error("User not found");
//           return;
//         }

//         const chat = await ChatModel.create({
//           senderId: senderUser.id,
//           receiverId: receiverUser.id,
//           message,
//         });

//         const receiverSocketId = socketIdByUserMobile[receiverMobileNo];

//         if (receiverSocketId) {
//           const messageData = { senderName: senderUser.name, receiverName: receiverUser.name, message };
//           console.log(`${messageData.senderName} sending to ----> ${messageData.receiverName} MESSAGE:---->`,message);

//           io.to(receiverSocketId).emit("private-chat", messageData);

//         } else {
//           console.log(`Receiver's socket ID not found for mobile number: ${socket.data.receiverMobileNo}`);
//         }
//       } catch (error) {
//         console.error("Error processing private chat:", error);
//       }
//     });

//   // Listen for typing event
//   socket.on("typing", (data: SocketData) => {
//     const receiverSocketId = socketIdByUserMobile[data.receiverMobileNo!];
//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit("typing", data);
//     }
//   });

//   // Listen for stopTyping event
//   socket.on("stopTyping", (data: SocketData) => {
//     const receiverSocketId = socketIdByUserMobile[data.receiverMobileNo!];
//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit("stopTyping", data);
//     }
//     });
    
//   });
// };











// import { Server, Socket } from "socket.io";
// import jwt from "jsonwebtoken";
// import { UserModel } from "../model/user.model";
// import ChatModel from "../model/chat.model";
// import mongoose from "mongoose";

// export const handleSocketConnection = (io: Server) => {
//   console.log("SOCKET ------>1");
//   const socketIdByUserMobile: { [mobile: number]: number } = {};
// console.log("---------------->",socketIdByUserMobile)
//   class CustomSocket extends Socket {
//     userMobile?: string;
//     receiverMobile?: string;
//   }
  
//   // Socket is connected
//   io.on("connection", (socket: CustomSocket) => {
//     // console.log("SOCK", socket);

//     let data: { receiverMobileNo?: string; senderMobileNo?: string; } = {};
//     socket.on("new-user-connect",  (name) => {
//       data=name
//       socket.userMobile = name.senderMobileNo as string; // Type assertion to ensure it's treated as string
//       socket.receiverMobile = name.receiverMobileNo as string; // Type assertion to ensure it's treated as string
//       socketIdByUserMobile[name.senderMobileNo as string] = socket.id; // Store socket ID associated with user mobile
//       console.log(`User with mobile number ${socket.userMobile} is connected with socket ID ${socket.id}`);
//     });
   
//     // socket.on("disconnect", () => {
//     //   delete socketIdByUserMobile[socket.userMobile];
//     //   console.log("User disconnected:", socket.id);
//     // });

//     // if (socket.receiverMobile !== socket.userMobile) {
//       socket.on("private-chat", async ({ message }: { message: string }) => {
//         try {
//           const receiverUser = await UserModel.findOne({
//             phone_number: data.receiverMobileNo
//           });
//           const senderUser = await UserModel.findOne({
//             phone_number: data.senderMobileNo
//           });
//           // console.log("000000000000000000000000000",receiverUser,senderUser)
//           if (!receiverUser || !senderUser) {
//             console.error("User not found");
//             return;
//           }

//           const chat = await ChatModel.create({
//             senderId: senderUser.id,
//             receiverId: receiverUser.id,
//             message,
//           });

//           // console.log("1----------->", chat);
//           const receiverSocketId = socketIdByUserMobile[data.receiverMobileNo];

//           // console.log("11111111111111111",receiverSocketId);
//           // console.log("11111111111111111",senderUser.name);
//           const senderName = senderUser.name;
//           const receiverName= receiverUser.name
//           if (receiverSocketId) {
//             // console.log("222222222222222222",receiverSocketId);
//             console.log(`${senderName}----> ${receiverName}`,message);
//             const messageData = {senderName,receiverName, message};
//             io.to(receiverSocketId).emit("private-chat", messageData);
//           } else {
//             console.log(`Receiver's socket ID not found for mobile number: ${socket.receiverMobile}`);
//           }
//         } catch (error) {
//           console.error("Error:", error);
//         }
//       });
//     }
//   )};








// import { Server, Socket } from "socket.io";
// import jwt from "jsonwebtoken";
// import { UserModel } from "../model/user.model";
// import ChatModel from "../model/chat.model";
// import mongoose from "mongoose";

// export const handleSocketConnection = (io: Server) => {
//   console.log("SOCKET ------>1");
//   const socketIdByUserId: { [userId: number]: string } = {};

//   class CustomSocket extends Socket {
//     userId?: any;
//     receiverId?: any;
//   }

//   io.use(async (socket: CustomSocket, next) => {
//     try {
//       const token = socket.handshake.headers.authorization;
//       if (!token) {
//         return next(new Error("Authentication failed. Token missing."));
//       }

//       const decodedToken = jwt.verify(
//         token,
//         process.env.Access_JWT_SECRET!
//       ) as { email: string };

//       const user = await UserModel.findOne({ email: decodedToken.email });

//       if (!user) {
//         return next(new Error("Authentication failed. User not found."));
//       }

//       socket.userId = user.id;
//       const receiverIdParam = socket.handshake.query.receiverId;

//       if (!receiverIdParam) {
//         return next(new Error("Invalid receiverId parameter."));
//       }

//       socket.receiverId = new mongoose.Types.ObjectId(
//         receiverIdParam as string
//       );
//       socketIdByUserId[user.id] = socket.id;

//       next();
//     } catch (error) {
//       console.error("Error during authentication:", error);
//       return next(new Error("Authentication failed. Token missing."));
//     }
//   });

//   // Socket is connected
//   io.on("connection", (socket: CustomSocket) => {
//     console.log(
//       `User ${socket.userId} is connected with socket ID ${socket.id}`
//     );

//     socket.on("disconnect", () => {
//       delete socketIdByUserId[socket.userId];
//       console.log("User disconnected:", socket.id);
//     });

//     if (socket.receiverId !== socket.userId) {
//       socket.on("private-chat", async ({ message }: { message: string }) => {
//         try {
//           const receiverId = socket.receiverId;
//           const senderId = socket.userId;

//           const chat = await ChatModel.create({
//             senderId,
//             receiverId,
//             message,
//           });

//           console.log("1----------->", chat);
//           if (receiverId !== undefined) {
//             const receiverSocketId = socketIdByUserId[receiverId];

//             if (receiverSocketId) {
//               if (typeof receiverSocketId === "string") {
//                 const chatMessage = chat.message;
//                 console.log("2----------->", chatMessage);

//                 io.to(receiverSocketId).emit("private-chat", chatMessage);

//               } else {
//                 console.error("Invalid receiver socket ID:", receiverSocketId);
//               }
//             } else {
//               console.log(`Receiver's socket ID not found for user ID: ${receiverId}`);
//               }
//           } else {
//             console.log("Receiver ID is undefined, cannot send the message.");
//           }
//         } catch (error) {
//           console.error("Error:", error);
//         }
//       });
//     }
//   });
// };

//   // io.use(async (socket: CustomSocket, next) => {
//   //   try {
//   //     const token = socket.handshake.headers.authorization;
//   //     if (!token) {
//   //       return next(new Error("Authentication failed. Token missing."));
//   //     }

//   //     const decodedToken = jwt.verify(
//   //       token,
//   //       process.env.Access_JWT_SECRET!
//   //     ) as { email: string };

//   //     const user = await UserModel.findOne({email : decodedToken.email});

//   //     if (!user) {
//   //       return next(new Error("Authentication failed. User not found."));
//   //     }

//   //     socket.userId = user.id;
//   //     const receiverIdParam = socket.handshake.query.receiverId;

//   //     if (!receiverIdParam) {
//   //       return next(new Error("Invalid receiverId parameter."));
//   //     }

//   //     socket.receiverId = new mongoose.Types.ObjectId(receiverIdParam as string);
//   //     socketIdByUserId[user.id] = socket.id;

//   //     const offlineMsgs: any = offlineMessages[socket.userId];

//   //     if (offlineMsgs && offlineMsgs.length > 0) {
//   //       offlineMsgs.forEach((offlineMsg: { senderId: any; message: any }) => {
//   //         socket.emit("private-chat", {
//   //           senderId: offlineMsg.senderId,
//   //           message: offlineMsg.message,
//   //         });
//   //       });
//   //       delete offlineMessages[socket.userId];
//   //     }
//   //     next();
//   //   } catch (error) {
//   //     console.error("Error during authentication:", error);
//   //     return next(new Error("Authentication failed. Token missing."));
//   //   }
//   // });

//   // Socket is connected
//   io.on("connection", (socket: CustomSocket) => {
//     console.log("SOCKET ------>3")
//     const sender_phone_number =  UserModel.findOne({phone_number : socket.sender_Mobile_no});
//     const receiver_phone_number = UserModel.findOne({phone_number : socket.receiver_Mobile_no});

//     console.log(`User ${socket.sender_Mobile_no} is connected with socket ID ${socket.id}`);

//     // socket.on("new-user-connect", (name) => {
//     //   console.log("username", name);
//     // });
//     socket.on("disconnect", () => {
//       delete socketIdByUserId[socket.userId];
//       console.log("User disconnected:", socket.id);
//     });

//     if (socket.receiverId !== socket.userId) {
//     console.log("SOCKET ------>4")

//       socket.on("private-chat", async ({ message }: { message: string}) => {
//         try {
//           console.log("SOCKET ------>5")

//           const receiverId = socket.receiverId;
//           const senderId = socket.userId;

//           const chat = await ChatModel.create({senderId,receiverId,message});

//           console.log("1----------->",chat)
//           if (receiverId !== undefined) {
//             const receiverSocketId = socketIdByUserId[receiverId];

//             if (receiverSocketId) {
//               if (typeof receiverSocketId === "string") {
//                 const chatMessage = chat.message;
//                 console.log("2----------->",chatMessage)
//                 console.log("3------------->",chat.message)

//                 io.to(receiverSocketId).emit("private-chat", chatMessage);
//               } else {
//                 console.error("Invalid receiver socket ID:", receiverSocketId);
//               }
//             } else {
//               console.log(`Receiver's socket ID not found for user ID: ${receiverId}`)
//             }
//           } else {
//             console.log("Receiver ID is undefined, cannot send the message.");
//           }
//         } catch (error) {
//           console.error("Error:", error);
//         }
//       });
//     }
//   });
// };
