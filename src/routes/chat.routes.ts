import { chatContext } from '../constant/constant';
import express from "express"
import { Router } from "express";
import { chatController } from '../controller/chat.controller';

const chatRoute = express.Router();

class ChatRouter{
    
    private router:Router;

    constructor(){
        this.router=Router();
    }

    chatRouter(){
        this.router.get("/",chatController.chat);
        return this.router;
    }
}

export const chatRouters= new ChatRouter();