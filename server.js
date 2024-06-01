const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const services = require('./src/services');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const hostname = "www.modernlife-s.com";
const SECRET_KEY = 'your_secret_key'; // Replace with your actual secret key

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

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
      .get(authenticateToken, async (req, res) => {
          try {
              const projects = await services.getProjects();
              res.json(projects);
          } catch (err) {
              console.error(err);
              res.status(500).json({ message: 'خطأ في الخادم. حاول مرة أخرى لاحقًا.' });
          }
      })
      .post(authenticateToken, upload.array('files'), async (req, res) => {
          console.log(req.body, req.files)
          try {
              const project = await services.createProject(req.body, req.files);
              res.json({ message: 'تم إنشاء المشروع بنجاح', project });
          } catch (err) {
              console.error(err);
              res.status(500).json({ message: 'خطأ في الخادم. حاول مرة أخرى لاحقًا.' });
          }
      })
      .put(authenticateToken, upload.array('files'), async (req, res) => {
          try {
              const project = await services.updateProject(req.body.id, req.body, req.files);
              res.json({ message: 'تم تحديث المشروع بنجاح', project });
          } catch (err) {
              console.error(err);
              res.status(500).json({ message: 'خطأ في الخادم. حاول مرة أخرى لاحقًا.' });
          }
      })
      .delete(authenticateToken, async (req, res) => {
          try {
              await services.deleteProject(req.body.id);
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
    console.log(`Server is running on http://${hostname}:${PORT}`);
});
