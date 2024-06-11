const pool = require('./db');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const fs = require('fs');


const userSchema = Joi.object({
    name: Joi.string().max(255).required(),
    email: Joi.string().email().max(255).required(),
    password: Joi.string().min(8).required(),
});



async function getProjects() {
    const [projects] = await pool.query('SELECT * FROM projects');
    for (const project of projects) {
        const [features] = await pool.query('SELECT * FROM features WHERE projectId = ?', [project.id]);
        const [services] = await pool.query('SELECT * FROM services WHERE projectId = ?', [project.id]);
        const [images] = await pool.query('SELECT * FROM images WHERE projectId = ?', [project.id]);
        const [units] = await pool.query('SELECT * FROM units WHERE projectId = ?', [project.id]);

        project.features = features;
        project.services = services;
        project.images = images;
        project.units = units;
    }
    return projects;
}

async function createProject(data, files) {
    // Convert projectFeatures and locationServices to arrays
    data.projectFeatures = data.projectFeatures ? JSON.parse(data.projectFeatures) : [];
    data.locationServices = data.locationServices ? JSON.parse(data.locationServices) : [];
    data.units = data.units ? JSON.parse(data.units) : [];


    const [result] = await pool.query(
          'INSERT INTO projects (projectName, aboutProject, video) VALUES (?, ?, ?)',
          [data.projectName, data.aboutProject, data.video]
    );
    const projectId = result.insertId;

    for (const feature of data.projectFeatures) {
        await pool.query('INSERT INTO features (projectId, feature) VALUES (?, ?)', [projectId, feature]);
    }

    for (const serviceObj of data.locationServices) {

        const image = files.serviceImages.find((file)=>"/uploads/"+file.originalname===serviceObj.image);
        await pool.query('INSERT INTO services (projectId, service, image) VALUES (?, ?, ?)', [projectId, serviceObj.service,image&&"/uploads/"+ image?.filename]);
    }

    for (const unit of data.units) {
        await pool.query('INSERT INTO units (projectId, name, size, numberOfRooms, price) VALUES (?, ?, ?, ?, ?)', [projectId, unit.name, unit.size, unit.numberOfRooms, unit.price]);
    }
if(files&&files.files){
    for (const file of files.files) {
        await pool.query('INSERT INTO images (projectId, filePath) VALUES (?, ?)', [projectId, `/uploads/${file.filename}`]);
    }
}

    return getProjectById(projectId);
}
async function getProjectById(id) {
    const [projects] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
    if (projects.length === 0) return null;

    const project = projects[0];
    const [features] = await pool.query('SELECT * FROM features WHERE projectId = ?', [id]);
    const [services] = await pool.query('SELECT * FROM services WHERE projectId = ?', [id]);
    const [images] = await pool.query('SELECT * FROM images WHERE projectId = ?', [id]);
    const [units] = await pool.query('SELECT * FROM units WHERE projectId = ?', [id]);

    project.features = features;
    project.services = services;
    project.images = images;
    project.units = units;

    return project;
}

async function updateProject(id, data, files, editedPaths) {
    data.projectFeatures = JSON.parse(data.projectFeatures || '[]');
    data.services = JSON.parse(data.services || '[]');
    data.units = JSON.parse(data.units || '[]');

    await pool.query(
          'UPDATE projects SET projectName = ?, aboutProject = ?, video = ? WHERE id = ?',
          [data.projectName || null, data.aboutProject || null, data.video || null, id]
    );

    await pool.query('DELETE FROM features WHERE projectId = ?', [id]);
    await pool.query('DELETE FROM services WHERE projectId = ?', [id]);
    await pool.query('DELETE FROM units WHERE projectId = ?', [id]);

    for (const feature of data.projectFeatures) {
        await pool.query('INSERT INTO features (projectId, feature) VALUES (?, ?)', [id, feature || null]);
    }

    for (const serviceObj of data.services) {
        let imagePath =/uploads/+ serviceObj.image;
        console.log(imagePath,"imagesss")
        const image=files.serviceImages?.find((file) => file.originalname === serviceObj.image.split('/').pop());

        if (image) {
                imagePath = `/uploads/${image.filename}`;
        }else{
            imagePath ="/uploads/"+serviceObj.image.match(/[^/]*$/)
        }
        await pool.query('INSERT INTO services (projectId, service, image) VALUES (?, ?, ?)', [id, serviceObj.service, imagePath]);
    }

    for (const unit of data.units) {
        await pool.query('INSERT INTO units (projectId, name, size, numberOfRooms, price) VALUES (?, ?, ?, ?, ?)', [id, unit.name || null, unit.size || null, unit.numberOfRooms || null, unit.price || null]);
    }

    if (editedPaths) {
        for (const path of editedPaths) {
            await pool.query('DELETE FROM images WHERE filePath = ?', [path]);
            fs.unlink(`public${path}`, (err) => {
                if (err) console.error(`Error deleting file: ${path}`, err);
            });
        }
    }

    if (files && files.files) {
        for (const file of files.files) {
            await pool.query('INSERT INTO images (projectId, filePath) VALUES (?, ?)', [id, `/uploads/${file.filename}`]);
        }
    }

    return getProjectById(id);
}


async function deleteProject(id) {
    // Fetch the images associated with the project
    const [images] = await pool.query('SELECT filePath FROM images WHERE projectId = ?', [id]);

    // Delete the images from the file system
    for (const image of images) {
        console.log(image);
        const path = image.filePath;
        fs.unlink(`public${path}`, (err) => {
            if (err) console.error(`Error deleting file: ${path}`, err);
        });
    }

    // Delete the images from the database
    await pool.query('DELETE FROM images WHERE projectId = ?', [id]);

    // Delete the project from the database
    await pool.query('DELETE FROM projects WHERE id = ?', [id]);
    await pool.query('DELETE FROM features WHERE projectId = ?', [id]);
    await pool.query('DELETE FROM services WHERE projectId = ?', [id]);
    await pool.query('DELETE FROM units WHERE projectId = ?', [id]);
}

// User services
async function createUser(data) {
    const { error } = userSchema.validate(data);
    if (error) {
        throw new Error(`Validation error: ${error.details[0].message}`);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const [result] = await pool.query(
          'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
          [data.name, data.email, hashedPassword]
    );
    return { id: result.insertId, name: data.name, email: data.email };
}

async function getUserByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
}

async function deleteUser(id) {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
}

async function updateUserPassword(id, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
}

async function getLatestProjects(limit = 5) {
    const [projects] = await pool.query('SELECT * FROM projects ORDER BY id DESC LIMIT ?', [limit]);
    for (const project of projects) {
        const [images] = await pool.query('SELECT * FROM images WHERE projectId = ?', [project.id]);

        project.images = images;
    }
    return projects;
}

module.exports = {
    getProjects,
    createProject,
    getProjectById,
    updateProject,
    deleteProject,
    createUser,
    getUserByEmail,
    deleteUser,
    updateUserPassword,
    getLatestProjects
};
