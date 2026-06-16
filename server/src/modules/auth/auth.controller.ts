import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { query, isPostgresEnabled } from '../../config/db';
import { BaseService } from '../../core/base.service';
import { successResponse, errorResponse } from '../../utils/response';

const JWT_SECRET = process.env['JWT_SECRET'] || 'ajr-hub-secret-2026';

export const authController = {
  async login(req: Request, res: Response): Promise<any> {
    const { email, password } = req.body;
    try {
      const q = 'SELECT id, data FROM records WHERE collection = $1 AND data->>\'email\' = $2';
      const params = ['users', email];
      
      let user: any = null;
      if (isPostgresEnabled) {
        const result = await query(q, params);
        user = result.rows[0] ? { ...result.rows[0].data, id: result.rows[0].id } : null;
      } else {
        const service = new BaseService('users');
        user = await service.findOne(email); //findOne handles email search by data mapping
      }

      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json(successResponse({ token, user: { id: user.id, email: user.email, role: user.role } }));
    } catch (err: any) {
      return res.status(500).json(errorResponse(err.message));
    }
  }
};
