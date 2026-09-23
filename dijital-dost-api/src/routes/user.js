import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Apply authMiddleware to protect the route
router.get('/user', authMiddleware, async (req, res) => {
  try {
    // req.user.userId comes securely from the verified JWT token
    const user = await User.findById(req.user.userId).select('-password'); // Exclude password hash
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error("User Fetch Error:", error);
    res.status(500).json({ error: 'Server error fetching user data' });
  }
});

export default router;