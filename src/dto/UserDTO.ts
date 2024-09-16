import { Types, Document } from 'mongoose';

interface IUser extends Document {
    _id: Types.ObjectId;
    email: string;
    username: string;
    user_id: string;
}

class userDTO { 
    _id: Types.ObjectId;
    email: string;
    username:string;
    user_id:string
    constructor(model: Document<unknown, {}, IUser> & IUser) { 
        this._id = model._id as Types.ObjectId;
        this.email = model.email;
        this.username = model.username;
        this.user_id = model.user_id
    }
}

export default userDTO;
