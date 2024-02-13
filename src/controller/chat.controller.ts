import { Request,Response } from "express";

class ChatController{
    async chat(req:Request,res:Response){
        try{
            res.sendFile(__dirname+'../../public/index.html')
        }
        catch(error){
            console.error("Error:", error);
        }
    }
}

export const chatController= new ChatController();