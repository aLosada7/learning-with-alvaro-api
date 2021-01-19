const express = require("express");
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const dotenv = require('dotenv');
const logger = require('morgan');

// Load env vars
dotenv.config({ path: `./config/${process.env.NODE_ENV}.env` });

// Initialize database
const db = require("./models");
db.sequelize.sync();

const app = express();

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use(cors());
app.use(logger('dev'))

// Route files
const auth = require('./routes/auth');

app.use('/v1/auth', auth);

const router = express.Router();
app.use('/v1/start', router);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

const transporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth: {
        user: 'aldc30sc@gmail.com',
        pass: '****',
    },
    secure: true, 
});

router.post('/text-mail', (req, res) => {
    const {to, subject, text } = req.body;
    console.log(subject)
    const mailData = {
        from: 'aldc30sc@gmail.com',
        to: to,
        subject: subject,
        text: text,
        html: '<b>Hey there! </b><br> This is our first message sent with Nodemailer<br/>',
    };

    transporter.sendMail(mailData, (error, info) => {
        if (error) {
            return console.log(error);
        }
        res.status(200).send({ message: "Mail send", message_id: info.messageId });
    });
});

module.exports = app;
