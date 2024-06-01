const bcrypt = require('bcrypt');

const password = 'admin123456789';

bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error('Error hashing password:', err);
        return;
    }
    console.log('Hashed password:', hash);
});
// INSERT INTO users (name, email, password) VALUES ('Default Admin', 'admin@example.com', '$2b$10$80O0wub6S5kSSJPdE2r24eyK8rQRIVbBWxV5jHmV4d.D03gIhtkFy');

// db pass J6y*9zG#2tT!pQ4u
// INSERT INTO users (name, email, password) VALUES ('Default Admin', 'admin@example.com', '$2b$10$80O0wub6S5kSSJPdE2r24eyK8rQRIVbBWxV5jHmV4d.D03gIhtkFy');
