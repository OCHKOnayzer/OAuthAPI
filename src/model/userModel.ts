import mongoose,{ Schema,model,Document,Types } from "mongoose";

interface IUser extends Document { 
    _id:Types.ObjectId
    username: string;
    password: string;
    email: string;
    avatar:string
};

const UserScheme:Schema = new Schema({
    user_id:{type:String,require:true},
    username:{type:String,required:true, unique:true},
    email:{type:String, required:true},
    service:{type:String, require:true}
});

const userModel =  model<IUser>('User', UserScheme);
export default userModel;