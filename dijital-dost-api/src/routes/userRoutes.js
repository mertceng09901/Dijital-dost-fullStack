const express = require('express');
const router  = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

router.delete('/delete',          authMiddleware, userController.deleteAccount);
router.put('/avatar',             authMiddleware, userController.updateAvatar);
router.get('/profile',            authMiddleware, userController.getProfile);
router.post('/coins/purchase',    authMiddleware, userController.purchaseCoins);
router.post('/voice/earn',        authMiddleware, userController.earnVoiceMinutes);
router.post('/premium/activate',  authMiddleware, userController.activatePremium);

module.exports = router;