const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const logger = require('morgan');

const errorHandler = require('./middleware/error');

// Load env vars
dotenv.config({ path: `./config/${process.env.NODE_ENV}.env` });

// Initialize database
const db = require("./models");
db.sequelize.sync();

const app = express();

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

// Error Handler
app.use(errorHandler);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

module.exports = app;
