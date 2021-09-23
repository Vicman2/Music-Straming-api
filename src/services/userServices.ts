import { BadRequestError, NotFoundError, UnAuthorizedError } from '../../lib/appError';
import { ArtistData, AuthUser, UserLogin } from '../Interfaces/UserInterfaces';
import UserModel from '../models/userModel'
import { encryptData } from '../utility/dataCryto';
import constants from '../config/constants';
import sendSignUpEmail from '../utility/emails/emailConfig/SignUpEmailConfig';
import  mogoose from 'mongoose';
import { SignUpEmailQueue } from '../utility/queue/emailQueues';




class UserServices{
    async addUser(userData: AuthUser){

        // Check if the user exists 
        const existingUser = await UserModel
            .findOne({email: userData.email})

        // Throw error if there is any
        if(existingUser) throw new NotFoundError("User already exist")

        // Create a new user since there are now no duplicate
        const newUser = await UserModel.create(userData)
        let dataToEncrypt = {
            id: newUser._id, 
            email: newUser.email,
            role: newUser.role
        }

        const token = encryptData(dataToEncrypt, 2)
        const dataToSend = {
            ...newUser._doc,
            token
        }

        // Send Email to user
        const queueData = {
            name: newUser.firstname, 
            email: newUser.email
        }

        SignUpEmailQueue.add(queueData, {
            attempts: 3, 
            delay: 15000
        })


        delete dataToSend.password

        return dataToSend
    }

    async login(loginDetails: UserLogin){
        // Check if the user exists 
        const existingUser = await UserModel
            .findOne({email: loginDetails.email})
        if(!existingUser) throw new NotFoundError("User not found")

        let dataToEncrypt = {
            id: existingUser._id, 
            email: existingUser.email,
            role: existingUser.role
        }

        const token = encryptData(dataToEncrypt, constants.JWT_USER_LOGIN_EXPIRATION)
        const dataToSend = {
            ...existingUser._doc,
            token
        }

        delete dataToSend.password

        return dataToSend
        
    }
    async getUsers(){
        const users = await UserModel
            .find()
            .select("-password")
        return users
    }

    async getUser(userData:AuthUser, data: any){
        // Authenticate the person making the request
        const user = await UserModel
            .findById(userData.id)
            .select("-password")
        if(!user) throw new UnAuthorizedError("User does not exist")

        // Fetch the user which the request was all about
        const userToFetch = await UserModel.findById(data.id)
        if(!userToFetch) throw new UnAuthorizedError("User not found")

        return userToFetch
    }

    async makeArtist(userData:AuthUser, artistData: ArtistData){
        // Authenticate the person making the request
        const user = await UserModel.findById(userData.id)
        if(!user) throw new UnAuthorizedError("User does not exist")


        const theArtist = await UserModel.findById(artistData.id)
        if(!theArtist) 
            throw new NotFoundError("User to be made artist not found")

        if(theArtist.isArtist)
            throw new BadRequestError("User is already an artist")

        // Make ther person an artist
        theArtist.isArtist = true
        theArtist.about = artistData.about

        // Update the document and return
        const updatedDocument = await UserModel
            .findByIdAndUpdate(artistData.id, theArtist, {new: true})
            .select("-password")

        return updatedDocument
    }

    // Follow user
    async followAndUnfollowUser(userData: AuthUser, followerId: string){
        // Authenticate the user
        const following = await UserModel.findById(userData.id)
        if(!following) throw new UnAuthorizedError("User does not exist")

        // Check if artist exists
        const follower = await UserModel.findById(followerId)
        if(!follower) 
            throw new NotFoundError("Artist do not exist")

        // Check if the userId is already in the followers array
        const existingFollower = [...follower.followers]
            .find(user => user.toString() === userData.id.toString())
        
        // If the user exist, remove from the followers of the follower
        // Also remove from the following of the following
        let userToReturn = null
        if(existingFollower){
                await UserModel.findOneAndUpdate({_id: follower._id}, {
                    $pull: {followers: mogoose.Types.ObjectId(following._id)}
                }, {new: true})

                userToReturn = await UserModel.findOneAndUpdate({_id: following._id}, {
                    $pull: {following: mogoose.Types.ObjectId(follower._id)}
                }, {new: true})
        }else{
            // If the user does not exist, add to the followers of the follower
            // Also add to the following of the following

            await UserModel.findOneAndUpdate({_id: follower._id}, {
                $push: {followers: mogoose.Types.ObjectId(following._id)}
            }, {new: true})

            userToReturn = await UserModel.findOneAndUpdate({_id: following._id}, {
                $push: {following: mogoose.Types.ObjectId(follower._id)}
            }, {new: true})
        }

        return userToReturn

    }   

    // Fetch user birthday

    async AllUserBirthday(){
    

        const  allUsers = await UserModel
            .find()

        const usersWithTodayAsBirthday = allUsers.filter(user => {
            const today = new Date(); 

            let userDateOfBirth = new Date(user.date_of_birth);
            // Check if the user month and date matches. 
            if(today.getDate() === userDateOfBirth.getDate() 
                && today.getMonth() === userDateOfBirth.getMonth()
            ) 
                return user
        })

        return usersWithTodayAsBirthday
    }

}

export default new UserServices()