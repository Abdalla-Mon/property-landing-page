const pool = require('./db');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const fs = require('fs');

// Schema validation using Joi
const projectSchema = Joi.object({
    id: Joi.number().optional(), // Allow id for update
    projectName: Joi.string().max(255).required(),
    aboutProject: Joi.string().required(),
    video: Joi.string().optional(),
    projectFeatures: Joi.array().items(Joi.string()).required(),
    locationServices: Joi.array().items(Joi.string()).required(),
    editedPaths: Joi.array().items(Joi.string()).optional() // Allow editedPaths for update
});

const userSchema = Joi.object({
    name: Joi.string().max(255).required(),
    email: Joi.string().email().max(255).required(),
    password: Joi.string().min(8).required(),
});

// Project services
async function getProjects() {
    const [projects] = await pool.query('SELECT * FROM projects');
    for (const project of projects) {
        const [features] = await pool.query('SELECT * FROM features WHERE projectId = ?', [project.id]);
        const [services] = await pool.query('SELECT * FROM services WHERE projectId = ?', [project.id]);
        const [images] = await pool.query('SELECT * FROM images WHERE projectId = ?', [project.id]);
        project.features = features;
        project.services = services;
        project.images = images;
    }
    return projects;
}

async function createProject(data, files) {
    // Parse JSON strings
    data.projectFeatures = JSON.parse(data.projectFeatures);
    data.locationServices = JSON.parse(data.locationServices);

    // Log parsed data for debugging
    console.log('Files:creation', files);

    const { error } = projectSchema.validate(data);
    if (error) {
        throw new Error(`Validation error: ${error.details[0].message}`);
    }

    const [result] = await pool.query(
          'INSERT INTO projects (projectName, aboutProject, video) VALUES (?, ?, ?)',
          [data.projectName, data.aboutProject, data.video]
    );
    const projectId = result.insertId;

    for (const feature of data.projectFeatures) {
        await pool.query('INSERT INTO features (projectId, feature) VALUES (?, ?)', [projectId, feature]);
    }

    for (const service of data.locationServices) {
        await pool.query('INSERT INTO services (projectId, service) VALUES (?, ?)', [projectId, service]);
    }

    for (const file of files) {
        console.log(file,"file")

        await pool.query('INSERT INTO images (projectId, filePath) VALUES (?, ?)', [projectId, `/uploads/${file.filename}`]);
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

    project.features = features;
    project.services = services;
    project.images = images;

    return project;
}

async function updateProject(id, data, files, editedPaths) {
    // Parse JSON strings
    data.projectFeatures = JSON.parse(data.projectFeatures);
    data.locationServices = JSON.parse(data.locationServices);

    // Log parsed data for debugging
    console.log('Files:', files);

    const { error } = projectSchema.validate(data);
    if (error) {
        throw new Error(`Validation error: ${error.details[0].message}`);
    }

    await pool.query(
          'UPDATE projects SET projectName = ?, aboutProject = ?, video = ? WHERE id = ?',
          [data.projectName, data.aboutProject, data.video, id]
    );

    // Clear old features, services, and images
    await pool.query('DELETE FROM features WHERE projectId = ?', [id]);
    await pool.query('DELETE FROM services WHERE projectId = ?', [id]);

    // Insert new features
    for (const feature of data.projectFeatures) {
        await pool.query('INSERT INTO features (projectId, feature) VALUES (?, ?)', [id, feature]);
    }

    // Insert new services
    for (const service of data.locationServices) {
        await pool.query('INSERT INTO services (projectId, service) VALUES (?, ?)', [id, service]);
    }

    // Handle deleted image paths
    if (editedPaths) {
        for (const path of editedPaths) {
            await pool.query('DELETE FROM images WHERE filePath = ?', [path]);
            console.log(path)
            fs.unlink(`public${path}`, (err) => {
                if (err) console.error(`Error deleting file: ${path}`, err);
            });
        }
    }

    // Insert new images
    for (const file of files) {
    console.log(file,"file")
        await pool.query('INSERT INTO images (projectId, filePath) VALUES (?, ?)', [id, `/uploads/${file.filename}`]);
    }

    return getProjectById(id);
}

async function deleteProject(id) {
    // Fetch the images associated with the project
    const [images] = await pool.query('SELECT filePath FROM images WHERE projectId = ?', [id]);

    // Delete the images from the file system
    for (const image of images) {
        console.log(image)
        const path = image.filePath
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

module.exports = {
    getProjects,
    createProject,
    getProjectById,
    updateProject,
    deleteProject,
    createUser,
    getUserByEmail,
    deleteUser,
    updateUserPassword
};
