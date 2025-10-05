import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth';

// Initialize Prisma client
const prisma = new PrismaClient();

// Types for this file
interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: any;
}

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

// Validation schemas
const CreateUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['ADMIN', 'MODERATOR', 'COACH', 'STUDENT']).optional()
});

const router = Router();

// JWT Secret (in production, this should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Helper function to generate JWT token
const generateToken = (userId: string, email: string, role: string): string => {
  const payload: JWTPayload = { userId, email, role };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

// Helper function to exclude password from user object
const excludePassword = (user: any) => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * POST /auth/register
 * Register a new user account
 */
router.post('/register', async (req, res) => {
  try {
    // Validate request body using Zod schema
    const validatedData = CreateUserSchema.parse(req.body);
    const { email, password, firstName, lastName, role = 'STUDENT' } = validatedData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'A user with this email address already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role as any, // Type assertion for enum
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Generate JWT token
    const token = generateToken(newUser.id, newUser.email, newUser.role);

    // Return success response (exclude password)
    const response: AuthResponse = {
      success: true,
      message: 'User registered successfully',
      token,
      user: excludePassword(newUser)
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('Registration error:', error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid input data',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    // Handle Prisma unique constraint violations
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'A user with this email address already exists'
      });
    }

    // Generic server error
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to register user'
    });
  }
});

/**
 * POST /auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', async (req, res) => {
  try {
    // Validate input
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Email and password are required'
      });
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(403).json({
        error: 'Account disabled',
        message: 'Your account has been disabled. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.role);

    // Return success response
    const response: AuthResponse = {
      success: true,
      message: 'Login successful',
      token,
      user: excludePassword(user)
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to authenticate user'
    });
  }
});

/**
 * POST /auth/logout
 * Logout user (client-side token removal)
 */
router.post('/logout', (req, res) => {
  // Note: JWT tokens are stateless, so logout is primarily handled client-side
  // In production, you might want to implement token blacklisting
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

/**
 * GET /auth/me
 * Get current user information from JWT token
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // User info is already attached by authenticateToken middleware
    res.status(200).json({
      success: true,
      user: req.user
    });

  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get user information'
    });
  }
});

/**
 * GET /auth/admin-test
 * Test admin-only endpoint
 */
router.get('/admin-test', authenticateToken, requireAdmin, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin access granted!',
    user: req.user
  });
});

/**
 * GET /auth/profile
 * Get detailed user profile
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        teamMemberships: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile could not be found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get user profile'
    });
  }
});

export default router;