import { userContext } from '../constant/constant';
import express from "express"
import { Router } from "express";
import { userController } from '../controller/user.controller';

const userRoute = express.Router();

class UserRouter{
    
    private router:Router;

    constructor(){
        this.router=Router();
    }

    userRouter(){
        this.router.post("/register",userController.register);
        this.router.post("/login",userController.login);
        return this.router;
    }
}

export const userRouters= new UserRouter();