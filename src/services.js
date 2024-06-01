const pool = require('./db');
const bcrypt = require('bcrypt');
const Joi = require('joi');

// Schema validation using Joi
const projectSchema = Joi.object({
    projectName: Joi.string().max(255).required(),
    aboutProject: Joi.string().required(),
    video: Joi.string().uri().optional(),
    projectFeatures: Joi.array().items(Joi.string()).required(),
    locationServices: Joi.array().items(Joi.string()).required(),
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
        await pool.query('INSERT INTO images (projectId, filePath) VALUES (?, ?)', [projectId, file.path]);
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

async function updateProject(id, data, files) {
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
    await pool.query('DELETE FROM images WHERE projectId = ?', [id]);

    // Insert new features
    for (const feature of data.projectFeatures) {
        await pool.query('INSERT INTO features (projectId, feature) VALUES (?, ?)', [id, feature]);
    }

    // Insert new services
    for (const service of data.locationServices) {
        await pool.query('INSERT INTO services (projectId, service) VALUES (?, ?)', [id, service]);
    }

    // Insert new images
    for (const file of files) {
        await pool.query('INSERT INTO images (projectId, filePath) VALUES (?, ?)', [id, file.path]);
    }

    return getProjectById(id);
}

async function deleteProject(id) {
    await pool.query('DELETE FROM projects WHERE id = ?', [id]);
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
