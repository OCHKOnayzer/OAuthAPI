import mongoose,{ Schema,model,Document,Types } from "mongoose";

interface TokenType extends Document { 
    _id:Types.ObjectId;
    user:Types.ObjectId;
    refreshToken:string
}

const TokenSchema:Schema = new Schema ({ 
    user:{type:Schema.Types.ObjectId,ref:'users'},
    refreshToken:{type:String, required:true}
})

const TokenModel = model<TokenType>('Tokens',TokenSchema)

export default TokenModel