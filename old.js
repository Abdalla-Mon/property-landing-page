// Import necessary modules
const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');

// Create Express application
const app = express();
const hostname = "www.modernlife-s.com";

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/'); // Destination folder for uploaded images
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Rename file to avoid overwriting
    }
});
const upload = multer({ storage: storage });

// Serve static files from the 'public' directory
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Define route for testing
app.get("/test", (req, res) => {
    res.json({ message: "This is a test endpoint" });
});

// Define route for uploading images
app.post("/upload", upload.single("file"), (req, res, next) => {
    try {
        // Handle file upload and generate link to uploaded image
        const imageUrl = req.protocol + "://" + req.get("host") + "/uploads/" + req.file.filename;
        res.send(imageUrl);
    } catch (err) {
        console.error("Error occurred while uploading image:", err);
        next(err); // Pass the error to the error handling middleware
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Error occurred:", err);
    res.status(500).send("Internal Server Error");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://${hostname}:${PORT}`);
});
