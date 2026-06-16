import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db';

const JWT_SECRET = process.env['JWT_SECRET'] || 'ajr-hub-secret-2026';

export const authController = {
  async login(req: Request, res: Response): Promise<any> {
    const { username, password } = req.body;
    try {
      // Mock db query for users (collection 'users' in dynamic_records)
      const result = await query(
        'SELECT id, data FROM dynamic_records WHERE collection_name = $1 AND data->>\'username\' = $2',
        ['users', username]
      );
      
      const user = result.rows[0] ? { ...result.rows[0].data, id: result.rows[0].id } : null;

      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
};
