const express = require('express');
const axios = require('axios');
const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = 4000;

app.use(express.urlencoded({ extended: false }));


//cloud database
const cloudDatabase = mysql.createConnection({
    host : process.env.URL_DATABASE_HOST,
    user : process.env.URL_DATABASE_USER,
    password : process.env.URL_DATABASE_PASSWORD,
    database:process.env.URL_DATABASE_NAME 
})


//localhost DATABASE connection
const localConnection = mysql.createConnection({
    host: process.env.LOCAL_DB_HOST,
    user: process.env.LOCAL_DB_USER,
    password: process.env.LOCAL_DB_PASSWORD,
    database: process.env.LOCAL_DB_NAME
});

// Connect to the local MySQL database
cloudDatabase.connect((err) => {
    if (err) {
        console.error('Error connecting to local database:', err);
        process.exit(1);
    }
    console.log('Cloud DATABASE seccesfully connected');
});

// Interval to check website status and update database
setInterval(async () => {
    const targetUrl = 'https://aadl3inscription2024.dz/AR/Inscription-desktop.php';
    let status = 'Open'; // Initial status
    const date = new Date();

    try {
        const response = await axios.head(targetUrl);
        if (response.status >= 200 && response.status < 300) {
            console.log(`Website is ${status} at ${currentTime}`);
        } else {
            status = 'Closed';
            console.log(`Website is ${status} at ${currentTime}`);
        }

        // Insert status into database
        cloudDatabase.query('INSERT INTO aadl (status, timing) VALUES (?, ?)', [status, date], (err, result) => {
            if (err) {
                console.error('Error inserting into database:', err);
            } else {
                console.log('Inserted into database successfully');
            }
        });
    } catch (error) {
        status = 'Closed';
        console.error('Error:', error.message);
        cloudDatabase.query('INSERT INTO aadl (status, timing) VALUES (?, ?)', [status, date], (err, result) => {
            if (err) {
                console.error('Error inserting into database:', err);
            } else {
                console.log('Inserted into database successfully');
            }
        });
    }
}, 60000);




// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});