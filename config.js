


 const fs = require('fs');
 if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });
 
 function convertToBool(text, fault = 'true') {
     return text === fault ? true : false;
 }
 module.exports = {
 SESSION_ID: process.env.SESSION_ID || "4CU3XKxa#fS4QKmaBJjHMXKw7yIhN8kzJLCn8UOe2olVcph2yDdU",
 MODE: process.env.MODE || "private",
 };
