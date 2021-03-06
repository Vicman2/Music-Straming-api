import Joi from 'joi'


const AddMusicFileSchema = Joi.array().min(2).max(2).required()

const EditMusicFileSchema = Joi.array().max(2).allow(null)

const AddMusicTextDataSchema = Joi.object({
    name: Joi.string().required(), 
    artist: Joi.string().min(3).required(), 
    category: Joi.string().min(3).required(),
})




export {
    AddMusicFileSchema, 
    EditMusicFileSchema,
    AddMusicTextDataSchema, 
}