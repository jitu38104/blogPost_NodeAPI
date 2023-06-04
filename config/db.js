require("dotenv").config();
const mysql = require("mysql");

const connectionString = mysql.createPool({
    host: "localhost",
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    multipleStatements: true,
});

connectionString.getConnection(err => {
    if(err) console.log("There is some issue in DB connection:", err.message);
    else console.log("DB is Connected!");
});

module.exports = connectionString;
