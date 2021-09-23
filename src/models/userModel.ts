import { Schema, model, Model} from "mongoose";
import { AUser } from "../Interfaces/UserInterfaces";
import { encryptData, hashString } from "../utility/dataCryto";
import constants from '../config/constants'


const UserSchema  = new Schema<AUser>({
    email: {
        type: String, 
        unique: true,
        required: true
    }, 
    firstname: {
        type: String, 
        required: true
    }, 
    lastname: {
        type: String, 
        required: true
    },
    date_of_birth: {
        type: Date, 
        required: true
    },  
    password: {
        type: String, 
        required: true
    }, 
    isArtist: {
        type: Boolean, 
        default: false
    }, 
    about: {
        type:String
    }, 
    playlist: [{
        type: Schema.Types.ObjectId, 
        required: true, 
        ref: "Playlist"
    }],
    role: {
        type:String,
        enum: [constants.ROLE.USER, constants.ROLE.ADMIN],
        default: constants.ROLE.USER
    }, 
    followers: [{
        type: Schema.Types.ObjectId, 
        required: true, 
        ref: "User"
    }],
    following: [{
        type: Schema.Types.ObjectId, 
        required: true, 
        ref: "User"
    }]
})


UserSchema.methods.generateToken = async function(){
    const user = this
    const dataToEncrypt = {
        _id : user._id,
        email: user.email
    }

    const generatedToken = encryptData(dataToEncrypt, 2)

    return generatedToken
    
}

UserSchema.pre("save", async function(next){
    const user = this
    if(user.isModified("password") || user.isNew){
        const hashedString = await hashString(user.password)
        user.password = hashedString
    }
    next()
})

const UserModel:Model<AUser>  = model("User", UserSchema)

export default UserModel