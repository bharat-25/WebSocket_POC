import http from "http";
import { Server } from "socket.io";
import { handleSocketConnection } from "../../controller/socket.controller";
import express from "express";
import path from "path";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.SOCKET_PORT;

app.use(express.json());

export const SOCKET = async () => {
  try {

    // Serve the chat application
    app.use("/chat", express.static(path.join(process.cwd(), "/public")));
    
    // Handle socket connection
    handleSocketConnection(io);


    server.listen(port, () => {
      console.log(`Socket.io server listening on port: ${port}`);
    });
  } catch (error) {
    console.error("Socket connection Error", error);
  }
};
