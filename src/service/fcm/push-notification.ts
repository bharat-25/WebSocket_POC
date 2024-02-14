import * as admin from "firebase-admin"
import {PushNotificationPayload} from '../../interface/push-notification.interface'
export  class PushNotificationService {
  
    private static instance: PushNotificationService;
    private adminInstance: admin.app.App;
  
    private constructor() {
      // Load Firebase service account key
      const serviceAccount = require("/home/admin188/Desktop/WebSocket_POC/firebaseConfig.json");
  
      // Initialize Firebase admin SDK
      this.adminInstance = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "...."
      });
    }
  
    public static getInstance(): PushNotificationService {
      if (!PushNotificationService.instance) {
        PushNotificationService.instance = new PushNotificationService();
      }
      return PushNotificationService.instance;
    }
  
    public async sendPushNotification(receiverFCMToken: string, payload: PushNotificationPayload): Promise<void> {
      const message: admin.messaging.Message = {
        token: receiverFCMToken,
        notification: {
          title: payload.title,
          body: payload.body
        }
      };
  
      try {
        console.log("PUSH NOTIFICATION MESSAGE: ", message)
        await this.adminInstance.messaging().send(message);
        console.log("Push notification sent successfully");
      } catch (error) {
        console.error("Error sending push notification:", error);
        throw error;
      }
    }
  }
