import { Router } from 'express';

const router = Router();

// Simple test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes working!' });
});

// Simple registration route for testing
router.post('/register', (req, res) => {
  console.log('Registration request body:', req.body);
  res.json({ success: true, message: 'Registration endpoint working' });
});

export default router;