const express = require('express');
require('dotenv').config()
const app = express();

const mysql = require('mysql');
const connection = mysql.createConnection({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database
});
    
connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Server!');
});
const open_tickets = require('./crons/open_tickets');
const new_tickets = require('./crons/new_tickets');


setInterval(() => {
    console.log(new Date())
    new_tickets()
    open_tickets()
}, 60000)


app.listen(process.env.PORT, () => {
    console.log('app is running on port ' + process.env.PORT)
})

