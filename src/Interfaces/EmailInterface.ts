

interface EmailData{
    fromEmail: string, 
    toEmails: string| string[], 
    subject: string, 
    html: string
}


// Template data interface
interface SignUpEmailDataTemp{
    name: string
}
interface BirthdayEmailDataTemp{
    name: String, 
    date: Date
}

// config data interface

interface SignUpEmailData{
    email: string, 
    name: string
}

interface BirthdayEmailData{
    email: string, 
    name: string, 
    date: Date
}

export{
    EmailData, 
    SignUpEmailDataTemp, 
    SignUpEmailData, 
    BirthdayEmailDataTemp, 
    BirthdayEmailData
}