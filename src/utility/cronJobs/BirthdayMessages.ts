import { AUser } from "../../Interfaces/UserInterfaces"
import { SendBirthdayEmailQueue } from "../queue/emailQueues"
import userServices from "../../services/userServices"

const CronJobs = require("node-cron")


// By 12am everyday
// Fech every user that their day date of birth is on the that particular day
// Send a birthday email to them by sending it to queues. 

const sendBirthdayMessage = ()=>{
    CronJobs.schedule('0 0 0 * * *', async() => {
        const birthdayUsers = await userServices.AllUserBirthday()
    
        for(let i = 0; i < birthdayUsers.length; i++){
            let data = {
                name: birthdayUsers[i].firstname, 
                date: birthdayUsers[i].date_of_birth
            }

            let opts = {
                attempts: 3
            }
            SendBirthdayEmailQueue.add(data, opts)
        }
        
    })
    
}



export default sendBirthdayMessage