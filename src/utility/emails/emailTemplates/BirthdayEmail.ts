import { BirthdayEmailDataTemp } from "../../../Interfaces/EmailInterface"


const signUpEmailTemp =(birthdayDataTemp: BirthdayEmailDataTemp) => `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Movie Streaming Application</title>
    </head>
    <body>
        <h1> Happy Birthday ${birthdayDataTemp.name.toUpperCase()}, </h1>
        <p>We celebrae the day you were born ${birthdayDataTemp.date.toTimeString()}</p>
        <p>Have fun and relax. </p>
    </body>
    </html>`


export default signUpEmailTemp