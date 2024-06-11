const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const services = require('./src/services');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const SECRET_KEY = 'eqewq89c4xxc44f13f46546bgfdgd'; // Replace with your actual secret key

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        // Use the timestamp and the original filename to ensure uniqueness
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const extension = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, extension);
        cb(null, `${baseName}-${uniqueSuffix}${extension}`);
    }
});

const upload = multer({ storage: storage });
// Accept multiple file fields
const uploadFields = upload.fields([
    { name: 'files', maxCount: 10 },
    { name: 'serviceImages', maxCount: 10 }
]);
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // Ensure static files are served correctly

// Middleware to check the token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

app.route('/api/projects')
      .get(async (req, res) => {
          try {
              const projects = await services.getProjects();
              res.json(projects);
          } catch (err) {
              console.error(err);
              res.status(500).json({ message: 'خطأ في الخادم. حاول مرة أخرى لاحقًا.' });
          }
      })
      .post(authenticateToken, uploadFields, async (req, res) => {
          try {
              const project = await services.createProject(req.body, req.files);
              res.json({ message: 'تم إنشاء المشروع بنجاح', project });
          } catch (err) {
              console.error(err);
              res.status(500).json({ message: `خطأ: ${err.message}` });
          }
      })
      .put(authenticateToken, uploadFields, async (req, res) => {
          try {
              if (typeof req.body.editedPaths === 'string') {
                  req.body.editedPaths = JSON.parse(req.body.editedPaths);
              }
              console.log(req.files,"req.files")
              const project = await services.updateProject(req.body.id, req.body, req.files, req.body.editedPaths);
              res.json({ message: 'تم تحديث المشروع بنجاح', project });
          } catch (err) {
              console.error('Error updating project:', err);
              res.status(500).json({ message: `خطأ: ${err.message}` });
          }
      });

app.get('/api/projects/latest', async (req, res) => {
    try {
        const projects = await services.getLatestProjects(5);
        res.json(projects);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'خطأ في الخادم. حاول مرة أخرى لاحقًا.' });
    }
});
app.get('/api/projects/:id', async (req, res) => {
    try {
        const project = await services.getProjectById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'المشروع غير موجود' });
        }
        res.json(project);
    } catch (err) {
        console.error('Error fetching project:', err);
        res.status(500).json({ message: 'خطأ في الخادم. حاول مرة أخرى لاحقًا.' });
    }
});

    app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
        try {

            await services.deleteProject(req.params.id);
            res.json({ message: 'تم حذف المشروع بنجاح' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'خطأ في الخادم. حاول مرة أخرى لاحقًا.' });
        }
    });

app.post('/api/register', async (req, res) => {
    try {
        const user = await services.createUser(req.body);
        res.json({ message: 'تم تسجيل المستخدم بنجاح', user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'خطأ في الخادم. حاول مرة أخرى لاحقًا.' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const user = await services.getUserByEmail(req.body.email);
        if (!user) {
            return res.status(404).json({ message: 'المستخدم غير موجود. تحقق من البريد الإلكتروني.' });
        }

        const passwordMatch = await bcrypt.compare(req.body.password, user.password);
        if (passwordMatch) {
            const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
            res.json({ message: 'تسجيل الدخول ناجح', token });
        } else {
            res.status(401).json({ message: 'كلمة المرور غير صحيحة. حاول مرة أخرى.' });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'خطأ في الخادم. حاول مرة أخرى لاحقًا.' });
    }
});

app.put('/api/users/:id/password', authenticateToken, async (req, res) => {
    try {
        await services.updateUserPassword(req.params.id, req.body.password);
        res.json({ message: 'تم تحديث كلمة المرور بنجاح' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'خطأ في الخادم. حاول مرة أخرى لاحقًا.' });
    }
});

app.delete('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        await services.deleteUser(req.params.id);
        res.json({ message: 'تم حذف المستخدم بنجاح' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'خطأ في الخادم. حاول مرة أخرى لاحقًا.' });
    }
});

app.get('/api/check-auth', authenticateToken, (req, res) => {
    res.json({ authenticated: true });
});

app.use((err, req, res, next) => {
    console.error("Error occurred:", err);
    res.status(500).json({ message: 'خطأ في الخادم. حاول مرة أخرى لاحقًا.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://:${PORT}`);
});
