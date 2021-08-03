const nodemailer = require("nodemailer");
const { EMAIL_HOST, EMAIL_PORT, EMAIL_USERNAME, EMAIL_PASSWORD } = require("../../config/constants");

// async..await is not allowed in global scope, must use a wrapper
async function sendEmail(emailBodySettings) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
//   let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: true, // true for 465, false for other ports
    auth: {
      user: EMAIL_USERNAME, 
      pass: EMAIL_PASSWORD, 
    },
  });


  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: emailBodySettings.sender_email, // sender address
    to: emailBodySettings.receiver_email, // list of receivers
    subject: emailBodySettings.email_subject, // Subject line
    // text: "Hello world?", // plain text body
    html: emailBodySettings.email_body, // html body
  });

  console.log(info)

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  
}

module.exports = {
    sendEmail
}