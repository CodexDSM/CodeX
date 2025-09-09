require('dotenv').config();

const config = {port: process.env.PORT | 5000,mongoURI: process.env.MONGO_URI | 'mongodb://localhost:27017/customer_db_default',};

module.exports = config;