import mongoose from "mongoose";
import '../../config/env'
const url:any = process.env.DB_CONNECTION_URL;

export const DB_connection = async () => {
  try {
    await mongoose.connect(url);
    console.log("Succesfully connected to the database");
    
  } catch (e) {
    console.log("Database connection Error");
  }
};