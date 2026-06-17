import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

// Constants
const PORT = 3000;
const JWT_SECRET = 'saas_forms_super_secret_key_123';
const DATA_FILE = path.join(__dirname, 'schema_datastores.json');

// Datastore schemas in-memory fallback + file persistence
interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'user';
}

interface FormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  placeholder: string;
  options?: string[];
}

interface FormRecord {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  ownerId: string;
  isActive: boolean;
}

interface ResponseRecord {
  id: string;
  formId: string;
  responses: Record<string, any>;
  submittedAt: string;
  metadata?: {
    ip?: string;
    device?: string;
  };
}

let db = {
  users: [] as UserRecord[],
  forms: [] as FormRecord[],
  responses: [] as ResponseRecord[]
};

// Seed & Load helper
function loadDatastore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      db = { ...db, ...parsed };
      console.log('Datastore safely reloaded from local schema:', DATA_FILE);
    } else {
      // Default seeds
      const adminPass = bcrypt.hashSync('demopassword123', 8);
      const userPass = bcrypt.hashSync('demopassword123', 8);
      
      db.users.push({
        id: 'admin-1',
        email: 'admin@saas.com',
        passwordHash: adminPass,
        role: 'admin'
      });
      db.users.push({
        id: 'user-1',
        email: 'owner@saas.com',
        passwordHash: userPass,
        role: 'user'
      });

      // Seed a default form
      db.forms.push({
        id: 'demo-form-id',
        name: 'Sales Inquiry Lead Form',
        description: 'Provide your company parameters to onboarding securely into our SaaS CRM portal.',
        fields: [
          { id: '1', label: 'Customer Name', type: 'text', required: true, placeholder: 'Jane Doe' },
          { id: '2', label: 'Business Email', type: 'email', required: true, placeholder: 'jane@company.com' },
          { id: '3', label: 'SaaS Plan Tier', type: 'dropdown', required: true, placeholder: '', options: ['Startup ($29/mo)', 'Enterprise ($199/mo)', 'Custom Quote'] },
          { id: '4', label: 'Inbound Message', type: 'textarea', required: false, placeholder: 'Tell us about your organization...' }
        ],
        ownerId: 'user-1',
        isActive: true
      });

      // Seed default submissions over several days for analytics visualizations
      const days = 7;
      const now = new Date();
      for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        // Add random count of seeds per day
        const dailyCount = Math.floor(Math.random() * 4) + 1;
        for (let j = 0; j < dailyCount; j++) {
          db.responses.push({
            id: `seed-resp-${i}-${j}`,
            formId: 'demo-form-id',
            responses: {
              '1': ['Alex Mercer', 'Chris Redfield', 'Leon Kennedy', 'Claire Redfield'][Math.floor(Math.random() * 4)],
              '2': 'demo@company.com',
              '3': ['Startup ($29/mo)', 'Enterprise ($199/mo)', 'Custom Quote'][Math.floor(Math.random() * 3)],
              '4': 'We are extremely excited to integrate!'
            },
            submittedAt: date.toISOString(),
            metadata: {
              ip: `192.168.1.${10 + i}`,
              device: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
            }
          });
        }
      }

      saveDatastore();
    }
  } catch (err) {
    console.error('Failed to parse dynamic JSON datastore:', err);
  }
}

function saveDatastore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to lock/persist datastore on disk:', err);
  }
}

loadDatastore();

// Express Server
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Authentication Helpers
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Auth session token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Auth session token invalid or expired' });
    }
    req.user = user;
    next();
  });
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  const { email, password, role } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const newUser: UserRecord = {
    id: 'usr-' + Date.now().toString(),
    email: email.toLowerCase(),
    passwordHash: bcrypt.hashSync(password, 8),
    role: role === 'admin' ? 'admin' : 'user'
  };

  db.users.push(newUser);
  saveDatastore();

  res.status(201).json({ message: 'Account parsed and created successfully!' });
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password fields required' });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ message: 'Incorrect email or password combination' });
  }

  const accessToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
  
  res.json({
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  });
});

// POST /api/auth/refresh
app.post('/api/auth/refresh', (req, res) => {
  // Silent refresh mock - returns a fresh token if parent is valid
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    jwt.verify(token, JWT_SECRET, { ignoreExpiration: true }, (err: any, decoded: any) => {
      if (err || !decoded) { return res.status(403).json({ message: 'Unrefreshable' }); }
      const newToken = jwt.sign({ id: decoded.id, email: decoded.email, role: decoded.role }, JWT_SECRET, { expiresIn: '15m' });
      return res.json({ accessToken: newToken });
    });
  } else {
    res.status(401).json({ message: 'Refresh token not found' });
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// GET /api/forms
app.get('/api/forms', authenticateToken, (req: any, res) => {
  let userForms = [];
  if (req.user.role === 'admin') {
    // Admins view all forms across the environment
    userForms = db.forms;
  } else {
    // Owners view their specific forms
    userForms = db.forms.filter(f => f.ownerId === req.user.id);
  }

  // Inject real submissions counts dynamically
  const enriched = userForms.map(f => {
    const subsCount = db.responses.filter(r => r.formId === f.id).length;
    return { ...f, submissionsCount: subsCount };
  });

  res.json(enriched);
});

// POST /api/forms
app.post('/api/forms', authenticateToken, (req: any, res) => {
  const { name, description, fields, isActive } = req.body;

  if (!name || !fields || !Array.isArray(fields)) {
    return res.status(400).json({ message: 'Invalid payload: Name and fields are required.' });
  }

  const newForm: FormRecord = {
    id: 'frm-' + Math.random().toString(36).substr(2, 9),
    name,
    description: description || '',
    fields,
    ownerId: req.user.id,
    isActive: isActive !== undefined ? isActive : true
  };

  db.forms.push(newForm);
  saveDatastore();

  res.status(201).json(newForm);
});

// GET /api/forms/:id (Public route)
app.get('/api/forms/:id', (req, res) => {
  const form = db.forms.find(f => f.id === req.params.id);
  if (!form) {
    return res.status(404).json({ message: 'Dynamics form schema not found' });
  }
  res.json(form);
});

// DELETE /api/forms/:id
app.delete('/api/forms/:id', authenticateToken, (req: any, res) => {
  const formIndex = db.forms.findIndex(f => f.id === req.params.id);
  
  if (formIndex === -1) {
    return res.status(404).json({ message: 'Form not found' });
  }

  const form = db.forms[formIndex];
  if (req.user.role !== 'admin' && form.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied: You are not the form owner.' });
  }

  db.forms.splice(formIndex, 1);
  // Clear associated submissions too
  db.responses = db.responses.filter(r => r.formId !== req.params.id);
  saveDatastore();

  res.json({ message: 'Form and all its associated collected leads deleted successfully.' });
});

// POST /api/forms/:id/submit (Public submit responses)
app.post('/api/forms/:id/submit', (req, res) => {
  const { responses } = req.body;
  const formId = req.params.id;

  const form = db.forms.find(f => f.id === formId);
  if (!form) {
    return res.status(404).json({ message: 'Form does not exist' });
  }

  if (!form.isActive) {
    return res.status(403).json({ message: 'Form submissions are offline or paused by the administrator.' });
  }

  // Server-side dynamic validation
  for (const field of form.fields) {
    const val = responses[field.id];
    if (field.required && (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0))) {
      return res.status(400).json({ message: `Field "${field.label}" is required and cannot be blank.` });
    }
  }

  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  const device = req.headers['user-agent'] || 'Unknown Crawler';

  const newResponse: ResponseRecord = {
    id: 'res-' + Math.random().toString(36).substr(2, 9),
    formId,
    responses,
    submittedAt: new Date().toISOString(),
    metadata: {
      ip: typeof ip === 'string' ? ip.replace('::ffff:', '') : '127.0.0.1',
      device: device.length > 80 ? device.substring(0, 80) + '...' : device
    }
  };

  db.responses.push(newResponse);
  saveDatastore();

  res.status(201).json({ message: 'Response submitted successfully!', id: newResponse.id });
});

// GET /api/forms/:id/responses (Owner view CRM)
app.get('/api/forms/:id/responses', authenticateToken, (req: any, res) => {
  const formId = req.params.id;
  const form = db.forms.find(f => f.id === formId);

  if (!form) {
    return res.status(404).json({ message: 'Form not found' });
  }

  if (req.user.role !== 'admin' && form.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied: Unauthorized ownership' });
  }

  const records = db.responses.filter(r => r.formId === formId);
  // Sort responses by newest submitted date
  records.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  res.json(records);
});

// GET /api/forms/:id/analytics (Performance reporting)
app.get('/api/forms/:id/analytics', authenticateToken, (req: any, res) => {
  const formId = req.params.id;
  const form = db.forms.find(f => f.id === formId);

  if (!form) {
    return res.status(404).json({ message: 'Form not found' });
  }

  if (req.user.role !== 'admin' && form.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const responses = db.responses.filter(r => r.formId === formId);

  // 1. Total Submissions count
  const totalSubmissions = responses.length;

  // 2. Submissions grouped per day (over active range or last 10 days)
  const submissionsPerDayMap: Record<string, number> = {};
  
  // Seed last 10 days with 0 counts to guarantee a nice timeline shape
  const now = new Date();
  for (let i = 9; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    submissionsPerDayMap[dateStr] = 0;
  }

  responses.forEach(r => {
    const dateStr = r.submittedAt.split('T')[0];
    if (submissionsPerDayMap[dateStr] !== undefined) {
      submissionsPerDayMap[dateStr]++;
    } else {
      // Out of standard 10 days range, but let's record it anyway
      submissionsPerDayMap[dateStr] = 1;
    }
  });

  const submissionsPerDay = Object.keys(submissionsPerDayMap).map(key => ({
    date: key,
    count: submissionsPerDayMap[key]
  })).sort((a, b) => a.date.localeCompare(b.date));

  // 3. Field-wise choice option distribution (for Dropdown, Radio, Checkboxes)
  const fieldStats: Record<string, Record<string, number>> = {};
  
  form.fields.forEach(field => {
    if (['dropdown', 'radio', 'checkbox'].includes(field.type)) {
      fieldStats[field.id] = {};
      // Seed options with 0
      if (field.options) {
        field.options.forEach(opt => {
          fieldStats[field.id][opt] = 0;
        });
      }
    }
  });

  responses.forEach(r => {
    form.fields.forEach(field => {
      if (['dropdown', 'radio', 'checkbox'].includes(field.type)) {
        const value = r.responses[field.id];
        if (value) {
          if (Array.isArray(value)) {
            // Checkbox multi selection options
            value.forEach(opt => {
              if (fieldStats[field.id][opt] !== undefined) {
                fieldStats[field.id][opt]++;
              }
            });
          } else {
            // Radio, Dropdown single choice strings
            if (fieldStats[field.id][value] !== undefined) {
              fieldStats[field.id][value]++;
            }
          }
        }
      }
    });
  });

  res.json({
    totalSubmissions,
    submissionsPerDay,
    fieldStats
  });
});


// ----------------------------------------------------
// STATIC SPA ROUTING CATCHALL
// ----------------------------------------------------
const distPath = path.join(__dirname, '../dist');

// Serve static build from dist folder
app.use(express.static(distPath));

// Fallback all other client-side routing to index.html to allow SPA working cleanly
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Fallback message while building
    res.status(200).send('<h2>Deploying system assets, please reload in a moment...</h2>');
  }
});

// Run Backend Express App
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Dynamic Form Builder Server actively running at http://0.0.0.0:${PORT}`);
});
