const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth'); 

router.delete('/delete', authMiddleware, userController.deleteAccount);

module.exports = router;