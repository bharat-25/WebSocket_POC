import express,{Express} from 'express'
import { portNumber, chatContext, userContext } from './constant/constant';
import {DB_connection} from "./integrations/database/dbConnection"
import { chatRouters } from './routes/chat.routes';
import { userRouters } from './routes/user.routes';
import { SOCKET } from './integrations/socket/socket.connection';
import { pushNotification } from './service/fcm/push-notification';

class App{
    private app!:Express;
    private port!: number | string ;
    private chatContext!: string;
    private userContext!:string;

    constructor() {
        this.startApp();
        DB_connection();
        SOCKET();
        pushNotification.initializeFirebase()
    }

    /**
     * @description Steps to Start the Express Sever
     */
    private startApp(){
        this.app=express();
        this.port=process.env.PORT || portNumber;
        this.loadGlobalMiddleWare();
        this.loadRouter();
        this.Server();
        
    } 

    /**
   * @description Load global Middlewares
   */
    private loadGlobalMiddleWare() {
        this.chatContext = chatContext;
        this.userContext=userContext;
        this.app.use(express.json());
        // this.port = portNumber;
    
    }

    /**
   * @description Load All Routes
   */
    private loadRouter() {
        this.app.use(this.chatContext ,chatRouters.chatRouter());
        this.app.use(this.userContext ,userRouters.userRouter());
      }

    /**
   * @description handler for Express server when initialising server
   */
    Server() {
        this.app.listen(this.port, this.callback);
    }
      private callback = () => {
            console.log(`Server listing on port: ${this.port}`);
          };
    }

    new App();