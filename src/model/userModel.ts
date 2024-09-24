import mongoose,{ Schema,model,Document,Types } from "mongoose";

interface IUser extends Document { 
    _id:Types.ObjectId
    user_id:string,
    first_name:string,
    last_name:string,
    email:string,
    number:string,
    service:string
};

const UserScheme:Schema = new Schema({
    user_id:{type:String,require:true,unique:true},
    first_name:{type:String,unique:false},
    last_name:{type:String,unique:false},
    email:{type:String,unique:false},
    number:{type:String,unique:false},
    service:{type:String,unique:false}
});

const userModel =  model<IUser>('User', UserScheme);
export default userModel;