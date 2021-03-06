import { 
    BadRequestError, 
    NotFoundError,
    UnAuthorizedError 
} from "../../lib/appError"
import { uploadAudioToCloud, uploadToCloud } from "../../lib/cloudinary"
import { redisAsync, redisClient } from "../../lib/redis"
import { AuthUser } from "../Interfaces/UserInterfaces"
import musicModel from "../models/musicModel"
import userModel from "../models/userModel"
import { checkMusicFilesForUpload } from '../utility/musicUtil'

class Music{

    // Add a new music
    async addMusic(userData: AuthUser, musicData: any){
        const user = await userModel.findById(userData.id)
        if(!user) throw new UnAuthorizedError("User do not exist")

        const filesForUpload = checkMusicFilesForUpload(musicData.files)

        // Check if music exists
        const exisitingMusic = await musicModel
            .findOne({name: musicData.name.toLowerCase()})
        if(exisitingMusic) throw new BadRequestError("Music already exist")

        // Check if user artist exists
        const exisitingArtist = await userModel
            .findOne({_id: musicData.artist, isArtist: true})
        if(!exisitingArtist) throw new NotFoundError("Artist do not exist")

        // Upload to cloudinary
        const cloudinaryImage = await uploadToCloud(filesForUpload.imageFile.path)
        const cloudinaryMusic = await uploadAudioToCloud(filesForUpload.audioFile.path)
       

        const dataToSave = {
            name: musicData.name, 
            artist: musicData.artist,
            audioLink: {
                secure_url: cloudinaryMusic.secure_url, 
                public_id: cloudinaryMusic.public_id
            },
            imageLink: {
                secure_url: cloudinaryImage.secure_url, 
                public_id: cloudinaryImage.public_id
            },
            category: musicData.category
        }

        const newMusic = await musicModel.create(dataToSave)

        return newMusic

    }

    // Fetch a particular music
    async getMusic(userData: AuthUser, musicData: any){
        const user = await userModel.findById(userData.id)
        if(!user) throw new UnAuthorizedError("User do not exist")

        const exisitingMusic = await musicModel.findOne({_id: musicData.id})
        if(!exisitingMusic) throw new UnAuthorizedError("Music do not exist")

        return exisitingMusic
    }

    // Fethces all Music 
    async getManyMusic(userData: AuthUser){
        const user = await userModel.findById(userData.id)
        if(!user) throw new UnAuthorizedError("User do not exist")

        const cachedMusicData = await redisAsync.getAsync("ManyMusic")

        if(cachedMusicData) return JSON.parse(cachedMusicData);


        const exisitingMusic = await musicModel
            .find()
            .populate("artist")

        // Add it to redis server
        redisClient.setex("ManyMusic", 120, JSON.stringify(exisitingMusic))

        return exisitingMusic

    }

    // Update a particular music
    async updateMusic(userData: AuthUser, musicData: any){

        // Check of the user exists
        const user = await userModel.findById(userData.id)
        if(!user) throw new UnAuthorizedError("User do not exist")

        // Check if the music to edit exist
        const exisitingMusic = await musicModel.findOne({_id: musicData.id})
        if(!exisitingMusic) throw new UnAuthorizedError("Music do not exist")

        // Check if artist exists 
        const existingArtist = await userModel.findById(musicData.artist)
        if(!existingArtist) throw new NotFoundError("Artist do not exist")



        if(musicData.files){
            // Check if there are files
            let filesForUpload = checkMusicFilesForUpload(musicData.files, "edit");

            // Check if there is any imageUpload 
            let cloudinaryImage = null

            if(filesForUpload.imageFile){
                // Upload to cloudinary
                cloudinaryImage = await uploadToCloud(filesForUpload.imageFile.path)
                musicData.imageLink = {
                    secure_url: cloudinaryImage.secure_url, 
                    public_id: cloudinaryImage.public_id
                }
            }


            // Check if there is any music upload
            let cloudinaryMusic = null

            if(filesForUpload.audioFile){
                // Upload to cloudinary
                cloudinaryMusic = await uploadAudioToCloud(filesForUpload.audioFile.path)
                musicData.audioLink = {
                    secure_url: cloudinaryMusic.secure_url, 
                    public_id: cloudinaryMusic.public_id
                }
            }  
        }

        // Remove the fields that are not needed fot the update and update the docucment
        let {id, files, ...dataToSave} = musicData

        const updatedDocument = await musicModel
            .findOneAndUpdate({_id: musicData.id}, dataToSave, {new:true})

        return updatedDocument
    }

    // Delete a particular music
    async deleteMuisc(userData: AuthUser, musicData: any){
        // Check of the user exists
        const user = await userModel.findById(userData.id)
        if(!user) throw new UnAuthorizedError("User do not exist")

        // Check if the music to delete exist
        const exisitingMusic = await musicModel.findOne({_id: musicData.id})
        if(!exisitingMusic) throw new UnAuthorizedError("Music do not exist")

        const deletedMusic = await musicModel.findOneAndDelete({_id: musicData.id})

        return deletedMusic
    }

    async likeMusic(userData:AuthUser, musicId: string){
        // Check of the user exists
        const user = await userModel.findById(userData.id)
        if(!user) throw new UnAuthorizedError("User do not exist")

        // Check if the music to like exist
        const exisitingMusic = await musicModel.findOne({_id: musicId})
        if(!exisitingMusic) throw new UnAuthorizedError("Music do not exist")

        // Check if user already liked music and throw an error
        let isMusicLiked = exisitingMusic.likes
            .find(likedUser => likedUser.toString() === user._id.toString() )
        if(isMusicLiked) throw new BadRequestError("User already liked music")

        const updatedMusic = await musicModel
            .findOneAndUpdate({_id: musicId},{$push: {likes: user._id}}, {new: true})
        
        return updatedMusic
    }
}


export default new Music()