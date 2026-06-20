import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db';
import { isPostgresEnabled } from '../config/db';
import { BaseService } from '../core/base.service';

const JWT_SECRET = process.env['JWT_SECRET'] || 'ajr-super-secret-jwt-key-2026';
const JWT_REFRESH_SECRET = process.env['JWT_REFRESH_SECRET'] || 'ajr-super-refresh-secret-jwt-key-2026';

export class AuthController {
  private usersService: BaseService;

  constructor() {
    this.usersService = new BaseService('users');
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    try {
      let user: any = null;
      
      if (isPostgresEnabled) {
        const result = await query('SELECT id, data FROM records WHERE collection = $1 AND data->>\'email\' = $2', ['users', email]);
        if (result.rowCount && result.rowCount > 0) {
          user = { id: result.rows[0].id, ...result.rows[0].data };
        }
      } else {
        const result = await this.usersService.findAll();
        user = result.data.find((u: any) => u.email === email);
      }

      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid && password !== user.password) {
        // Fallback for plain text seeded passwords in memory db
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Generate tokens
      const payload = { id: user.id || user._id, email: user.email, role: user.role };
      const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
      const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        accessToken,
        refreshToken, // Send it in response as well just in case
        user: {
          id: user.id || user._id,
          email: user.email,
          role: user.role,
          fullName: user.fullName
        }
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ error: 'Refresh token missing' });
      return;
    }

    try {
      const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
      const newPayload = { id: payload.id, email: payload.email, role: payload.role };
      const accessToken = jwt.sign(newPayload, JWT_SECRET, { expiresIn: '15m' });
      
      res.json({ accessToken });
    } catch (error) {
      res.status(403).json({ error: 'Invalid refresh token' });
    }
  }

  async logout(req: Request, res: Response) {
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  }

  async me(req: Request, res: Response) {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    // optionally fetch the latest user info from DB
    res.json({ user: req.user });
  }

  async register(req: Request, res: Response) {
    const { email, password, role } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    try {
      let existingUser = null;
      if (isPostgresEnabled) {
        const result = await query('SELECT id FROM records WHERE collection = $1 AND data->>\'email\' = $2', ['users', email]);
        if (result.rowCount && result.rowCount > 0) {
          existingUser = result.rows[0];
        }
      } else {
        const result = await this.usersService.findAll();
        existingUser = result.data.find((u: any) => u.email === email);
      }

      if (existingUser) {
        res.status(400).json({ error: 'Email already registered' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userRole = role === 'admin' ? 'admin' : 'user';
      const fullName = userRole === 'admin' ? 'Super Admin' : 'SaaS Owner';

      const newUser = await this.usersService.create({
        email,
        password: hashedPassword,
        role: userRole,
        fullName,
        status: 'active'
      });

      res.status(201).json({
        message: 'Registration successful',
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          fullName: newUser.fullName
        }
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Internal server error during registration' });
    }
  }
}
