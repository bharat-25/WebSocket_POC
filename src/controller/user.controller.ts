import { Request, Response } from "express";
import { userService } from "../service/user.service";
import { UserModel } from "../model/user.model";
import bcrypt from "bcrypt";

export class UserController {
  // constructor() {
  //   // Bind methods to the instance of the class
  //   this.register = this.register.bind(this);
  //   this.login = this.login.bind(this);
  //   this.handleError = this.handleError.bind(this);
  // }
  async register(req: Request, res: Response) {
    try {
      if (req.body == undefined) {
        res.status(400).json({ Message: "Pls enter the all details" });
      }
      const { name, email, password, phone_number } = req.body;

      const existingUser = await this.isUserExist(req.body.email);

      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const userData = req.body;
      const newUser = await userService.register(userData);
      console.log(newUser);

      res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (error) {
      console.error("An error occurred:", error);
    return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  private async isUserExist(email: string) {
    try {
      return await UserModel.findOne({ email });
    } catch (error) {
      console.error("Error occurred in isUserExist:", error);
    }
  }

  async login (req: Request, res: Response){
    try {
      const { email, password } = req.body;
      const user: any = await UserModel.findOne({ email: email });

      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const isValidPassword = await bcrypt.compare(password.toString(),user?.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: "Wrong Password" });
      }
      const userId = user._id;
      const userToken = await userService.login(userId, email);

      res.status(200).json({ message: "Successfully login", Access_token: userToken });
      
    } catch (error) {
      // this.handleError(res, error);
      console.error("An error occurred:", error);
    return res.status(500).json({ message: "Internal Server Error" });
    }
  };

  // private async handleError(res: Response, error: any) {
  //   console.error("An error occurred:", error);
  //   return res.status(500).json({ message: "Internal Server Error" });
  // }
}
export const userController = new UserController();
