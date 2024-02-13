import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
    name: {
        type: String,
        required:  [true,'Please provide an name '],
        minlength: 3
    },
    email: {
        type: String,
        required: [true,'Please provide an email'],
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true,'Please provide a password'],
        minlength: 6  
    },
    phone_number:{
        type : Number ,
        required:true,
        minlength:10,
        maxlength:13,
        unique:true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
})

const UserModel = mongoose.model('User', UserSchema);
export { UserModel };