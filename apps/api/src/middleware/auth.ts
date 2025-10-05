import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        firstName: string;
        lastName: string;
      };
    }
  }
}

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Middleware to verify JWT tokens and attach user info to request
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No authorization token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Get user from database to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'User not found or account disabled'
      });
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    };

    next();

  } catch (error) {
    console.error('Token verification error:', error);

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({
        error: 'Invalid token',
        message: 'Authorization token is invalid or expired'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to authenticate token'
    });
  }
};

/**
 * Middleware to check if user has required role(s)
 */
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

/**
 * Middleware for admin-only routes
 */
export const requireAdmin = requireRole('ADMIN');

/**
 * Middleware for moderator or admin routes
 */
export const requireModerator = requireRole('ADMIN', 'MODERATOR');

/**
 * Middleware for coach, moderator or admin routes
 */
export const requireCoach = requireRole('ADMIN', 'MODERATOR', 'COACH');

/**
 * Optional authentication - adds user info if token is present but doesn't require it
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true
        }
      });

      if (user && user.isActive) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName
        };
      }
    }

    next();

  } catch (error) {
    // Ignore token errors for optional auth
    next();
  }
};

/**
 * Middleware to check if user owns the resource or has elevated permissions
 */
export const requireOwnershipOrRole = (userIdParam: string, ...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }

    const resourceUserId = req.params[userIdParam];
    const isOwner = req.user.id === resourceUserId;
    const hasRole = roles.includes(req.user.role);

    if (!isOwner && !hasRole) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only access your own resources or need elevated permissions'
      });
    }

    next();
  };
};

export default {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireModerator,
  requireCoach,
  optionalAuth,
  requireOwnershipOrRole
};