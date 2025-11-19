const express = require('express');
const router = express.Router();
const { postRegister, postLogin, getUser, updateUser, deleteUser, getAdmin, getAllUsers, blockUser, makeAdmin } = require('../controllers/auth.controller')
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.post('/register', postRegister);

router.post('/login', postLogin);

router.get('/user', authMiddleware, getUser);

router.put('/passwordUpdate', authMiddleware, updateUser);

router.delete('/delete/:id', authMiddleware, deleteUser);

router.get('/admin', authMiddleware, adminMiddleware, getAdmin);

router.get('/users', authMiddleware, adminMiddleware, getAllUsers)

router.patch("/block/:id", authMiddleware, adminMiddleware, blockUser)

router.patch("/make-admin/:id", authMiddleware, adminMiddleware,makeAdmin)

module.exports = router;