const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const hbs = require("nodemailer-express-handlebars");

// Load env vars
dotenv.config({ path: `./config/${process.env.NODE_ENV}.env` });

const transporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
    secure: true, 
});

const options = {
    viewEngine: {
      partialsDir: __dirname + "/../views/partials",
      layoutsDir: __dirname + "/../views/layouts",
      extname: ".hbs"
    },
    extName: ".hbs",
    viewPath: "views"
};

transporter.use("compile", hbs(options));

const sendEmail = async ({to, subject, text, template, context}) => {
    const mailData = {
        to,
        from: 'aldc30sc@gmail.com',
        subject,
        text,
        template,
        context
    };

    let emailResponse = null;

    emailResponse =  await transporter.sendMail(mailData)
}

module.exports = sendEmail;