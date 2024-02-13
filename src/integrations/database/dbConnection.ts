import mongoose from "mongoose";
import '../../config/env'
import appConfig from "../../config/appConfig";
const url = appConfig.env.DB_URL;
console.log("-------------->url is------__>",url)

export const DB_connection = async () => {
  try {
    await mongoose.connect(url);
    console.log("Succesfully connected to the database");
    
  } catch (e) {
    console.log("Database connection Error");
  }
};