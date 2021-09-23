import emailSender from ".."
import birthdayEmailTemp from "../emailTemplates/BirthdayEmail"
import constants from "../../../config/constants"
import { BirthdayEmailData } from "../../../Interfaces/EmailInterface"

const sendBirthdayEmail= async (data: BirthdayEmailData) => {
    const signUpEmailData = {
        fromEmail: constants.COMPANY_EMAIL.HELP, 
        toEmails: data.email,
        subject: "BIRTHDAY WISHES", 
        html: birthdayEmailTemp({name: data.name, date: data.date})
    }

    await emailSender(signUpEmailData)

}


export default sendBirthdayEmail