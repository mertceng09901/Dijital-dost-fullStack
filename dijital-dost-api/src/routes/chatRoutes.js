const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth'); 
const { chatLimiter } = require('../middleware/rateLimiter');

// Yazılı mesaj
router.post('/send', authMiddleware, chatLimiter, chatController.sendMessage);
// Sesli mesaj (STT + cevap)
router.post('/voice', authMiddleware, chatLimiter, chatController.sendVoice);
// Sohbet geçmişi
router.get('/history', authMiddleware, chatController.getHistory);

module.exports = router;