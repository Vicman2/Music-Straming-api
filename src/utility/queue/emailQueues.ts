import Queue, {Job} from "bull"
import constants from "../../config/constants";
import { BirthdayEmailData, SignUpEmailData } from "../../Interfaces/EmailInterface";
import sendSignUpEmail from "../emails/emailConfig/SignUpEmailConfig";
import sendBirthdayEmail from "../emails/emailConfig/BirthdayEmailConfig";

const SignUpEmailQueue = new Queue("SignUp_Email_Queue", {redis: {
    host: constants.REDIS_CONFIGURATION.REDIS_HOST, 
    port: constants.REDIS_CONFIGURATION.REDIS_PORT, 
    password: constants.REDIS_CONFIGURATION.REDIS_PASSWORD, 
}});

const SendBirthdayEmailQueue = new Queue("Birthday_Email_Queue", {redis: {
    host: constants.REDIS_CONFIGURATION.REDIS_HOST, 
    port: constants.REDIS_CONFIGURATION.REDIS_PORT, 
    password: constants.REDIS_CONFIGURATION.REDIS_PASSWORD, 
}})


SignUpEmailQueue.process(async (job: Job<SignUpEmailData>)=> {
    const result = await sendSignUpEmail(job.data)
    return result
})


 SendBirthdayEmailQueue.process(async(job:Job<BirthdayEmailData>) => {
    const result = await  sendBirthdayEmail(job.data)
    return result
 })


export{
    SignUpEmailQueue, 
    SendBirthdayEmailQueue
}
