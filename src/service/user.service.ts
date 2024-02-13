import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../model/user.model";

class UserService {

    private bcryptSaltRounds = 5;
    private jwtSecret = process.env.Access_JWT_SECRET;
    private jwtExpiration = process.env.JWT_TIME;
    
    async register (userData: any){
    try {
      const { name, email, password, phone_number } = userData;
      const encryptPass = await bcrypt.hash(password, this.bcryptSaltRounds);
      const registerdata = new UserModel({
        name,
        email,
        password: encryptPass,
        phone_number,
      });
      await registerdata.save();
      return registerdata;
    } catch (error) {
        console.error("Error in UserService - register:", error);
        throw new Error("Failed to register user");
    }
  };
   
  async login(userID:any, email:string){
    try {
      const token = jwt.sign({ userID, email },  this.jwtSecret, {
        expiresIn: this.jwtExpiration,
      });
      return token;
    } catch (error) {
        console.error("Error in UserService - login:", error.message);
        throw new Error("Failed to generate login token");
    }
  }
}
export const userService = new UserService();
