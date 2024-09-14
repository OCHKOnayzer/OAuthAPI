import ApiError from "src/ApiError/ApiErrors"
import userModel from "src/model/userModel"
import { UserRequest } from "src/interface/oauthInterface"

class UserService{ 

    static async CreateUserService(requestItem:UserRequest){ 

        try{
             
            const userM = userModel.findOne({})


        }catch(e:any){ 

        }

    }

}

export default UserService