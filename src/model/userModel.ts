import mongoose,{ Schema,model,Document,Types } from "mongoose";

interface IUser extends Document { 
    _id:Types.ObjectId
    user_id:string,
    username: string;
    first_name:string,
    last_name:string,
    email:string,
    number:string,
    service:string
};

const UserScheme:Schema = new Schema({
    user_id:{type:String,require:true},
    username:{type:String,required:true, unique:true},
    first_name:{type:String},
    last_name:{type:String},
    email:{type:String, required:true},
    number:{type:String},
    service:{type:String, require:true}
});

const userModel =  model<IUser>('User', UserScheme);
export default userModel;