import { Types, Document } from 'mongoose';

interface IUser extends Document {
    _id: Types.ObjectId;
    user_id:string,
    first_name:string,
    last_name:string,
    email:string,
    number:string,
    service:string
}

class userDTO { 
    _id: Types.ObjectId;
    user_id:string;
    first_name:string;
    last_name:string;
    email:string;
    number:string;
    service:string;
    constructor(model: Document<unknown, {}, IUser> & IUser) { 
        this._id = model._id as Types.ObjectId;
        this.user_id = model.first_name;
        this.first_name = model.first_name;
        this.last_name = model.last_name;
        this.email = model.email;
        this.number = model.number
        this.service = model.number
    }
}

export default userDTO;
