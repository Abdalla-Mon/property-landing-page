const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: '172.105.90.92', // The shared IP address
    port: 3306, // Default MySQL port
    user: 'modernli_admin', // Replace with your MySQL username
    password: 'J6y*9zG#2tT!pQ4u', // The generated password
    database: 'modernli_properties',
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = pool;
