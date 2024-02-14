
# WebSocket Chat Application

This is a simple WebSocket chat application built using Node.js, Express.js, Socket.IO, kafka and Firebase Cloud Messaging (FCM) for push notifications.

## Table of Contents

- [Features](#features)
- [Technologies Used](#TechnologiesUsed)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Push Notifications](#push-notifications)

## Features

- Real-time messaging using WebSocket.
- Message queuing and broadcasting using Kafka.
- Push notifications for new messages using FCM
- Responsive UI for both desktop and mobile devices

## Technologies Used

    Node.js
    Express.js
    WebSocket
    Kafka
    Push Notification Service (e.g., Firebase Cloud Messaging)
    HTML/CSS/JavaScript for UI

## Installation

1. Clone the repository:
```typescript
https://github.com/bharat-25/WebSocket_POC.git
```


2. Navigate to the project directory:
```typescript
cd websocket-chat
```


3. Install dependencies:
```typescript
npm install
```

4. Set up environment variables:
```typescript
DEV_APPLICATION_PORT
SOCKET_PORT=9000
DEV_DB_URL
Access_JWT_SECRET
JWT_TIME
SALT
```

5. Start Kafka on local before run server

## Usage

1. Start the server:
```typescript
npm run local
```
2.  Access the application:
Open your browser and navigate to http://localhost:9000/chat to access the WebSocket chat application.

3. Enter your mobile number and the receiver's mobile number to start chatting.

## Configuration

- To configure Firebase Cloud Messaging (FCM) for push notifications, replace the `firebaseConfig.json` file in the `config` directory with your own service account key obtained from the Firebase Console.

- Make sure to set the correct `databaseURL` in the Firebase admin initialization in the `push-notification.service.ts` file.

## Push Notifications

- Push notifications are sent using Firebase Cloud Messaging (FCM). Make sure you have configured FCM correctly before using push notifications in the application.


## Documentation
https://docs.google.com/document/d/1MH3h2H1fTJRW8q4MEJVHWB0Cv7yHh_RP0iJ3vbGwAmM/edit?usp=sharing