import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, delay, tap } from 'rxjs';

export interface AdminApp {
  id: string;
  name: string;
  domain: string;
  status: 'live' | 'deploying' | 'failed';
  plan: 'Starter' | 'Pro' | 'Enterprise' | 'Lite' | 'Standard';
  apiUsage: number;
  lastUpdated: string;
  environment: 'Production' | 'Staging' | 'Sandbox';
  features: {
    marketplace: boolean;
    services: boolean;
    analytics: boolean;
  };
  apiKey: string;
}

export interface WebsiteConfig {
  siteName: string;
  logoUrl: string;
  theme: 'light' | 'dark';
  globalFeatures: {
    maintenanceMode: boolean;
    userRegistration: boolean;
  };
  features: {
    marketplace: boolean;
    services: boolean;
    analytics: boolean;
  };
}

export interface RateLimiterConfig {
  rpm: number;
  rph: number;
  burst: number;
  enabled: boolean;
  status: 'safe' | 'warning' | 'critical';
}

export interface StaticAnalytics {
  apiUsage: { date: string; requests: number }[];
  errors: number;
  activeUsers: number;
  totalRequests: number;
}

export interface ProjectPolicy {
  api: {
    rpmLimit: number;
    rpHourLimit: number;
    allowedOrigins: string;
    ipWhitelist: string;
    endpointLimits: { endpoint: string; maxRpm: number }[];
  };
  security: {
    authRequired: boolean;
    tokenExpiryMinutes: number;
    accessRoles: string;
    geoRestrictions: string;
    sessionLimits: number;
  };
  usage: {
    maxDailyCalls: number;
    maxUsers: number;
    storageLimitGb: number;
  };
}

export interface ProjectUser {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Developer' | 'Viewer';
  status: 'Active' | 'Invited';
  lastActive: string;
}

export interface ApiKeyDef {
  id: string;
  name: string;
  keyPrefix: string;
  created: string;
  lastUsed: string;
  permissions: string[];
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  enabled: boolean;
}

export interface BackupRun {
  id: string;
  date: string;
  sizeMb: number;
  status: 'Completed' | 'Failed';
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  ip: string;
}

export interface ProjectPlugin {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  status: 'Active' | 'Configuring' | 'Error';
}

export interface BillingData {
  plan: string;
  currentSpend: number;
  estimatedSpend: number;
  apiCalls: number;
  apiLimit: number;
  storageGb: number;
  storageLimit: number;
}

export interface ProjectLog {
  id: string;
  timestamp: string;
  type: 'API' | 'Error' | 'Deploy';
  severity: 'Info' | 'Warning' | 'Critical';
  message: string;
}

export interface ProjectData extends AdminApp {
  policies: ProjectPolicy;
  logs: ProjectLog[];
  users: ProjectUser[];
  apiKeys: ApiKeyDef[];
  alerts: AlertRule[];
  backups: BackupRun[];
  auditLogs: AuditEvent[];
  plugins: ProjectPlugin[];
  billing: BillingData;
}

export interface AppToast {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminStoreService {
  // Master State Signals
  projects = signal<ProjectData[]>([
    {
      id: 'app_1',
      name: 'AJR Commerce',
      domain: 'ajr-commerce.vercel.app',
      status: 'live',
      plan: 'Pro',
      apiUsage: 45200,
      lastUpdated: new Date().toISOString(),
      environment: 'Production',
      features: { marketplace: true, services: true, analytics: true },
      apiKey: 'sk_live_abc123...',
      policies: {
        api: { rpmLimit: 1000, rpHourLimit: 50000, allowedOrigins: '*', ipWhitelist: '', endpointLimits: [{ endpoint: '/api/checkout', maxRpm: 100 }] },
        security: { authRequired: true, tokenExpiryMinutes: 60, accessRoles: 'admin,user', geoRestrictions: 'None', sessionLimits: 5 },
        usage: { maxDailyCalls: 100000, maxUsers: 5000, storageLimitGb: 50 }
      },
      logs: [
        { id: '1', timestamp: new Date().toISOString(), type: 'API', severity: 'Info', message: 'API usage standard normal' },
        { id: '2', timestamp: new Date(Date.now() - 50000).toISOString(), type: 'Deploy', severity: 'Info', message: 'Deployment v2.4.1 successful' },
        { id: '3', timestamp: new Date(Date.now() - 100000).toISOString(), type: 'Error', severity: 'Warning', message: 'High latency on /api/auth' }
      ],
      users: [
        { id: 'u1', name: 'Admin One', email: 'admin@ajr.dev', role: 'Owner', status: 'Active', lastActive: new Date().toISOString() },
        { id: 'u2', name: 'Dev Team', email: 'dev@ajr.dev', role: 'Developer', status: 'Active', lastActive: new Date(Date.now() - 86400000).toISOString() }
      ],
      apiKeys: [
        { id: 'k1', name: 'Production Main', keyPrefix: 'sk_live_abc...', created: new Date(Date.now() - 30 * 86400000).toISOString(), lastUsed: new Date().toISOString(), permissions: ['Read', 'Write'] },
        { id: 'k2', name: 'ReadOnly Integration', keyPrefix: 'sk_live_xyz...', created: new Date(Date.now() - 10 * 86400000).toISOString(), lastUsed: new Date(Date.now() - 3600000).toISOString(), permissions: ['Read'] }
      ],
      alerts: [
        { id: 'a1', name: 'High Error Rate', condition: 'Error rate > 5% for 5m', action: 'Email: admin@ajr.dev', enabled: true },
        { id: 'a2', name: 'DB Connection Limit', condition: 'Connections > 90%', action: 'Slack: #ops', enabled: true }
      ],
      backups: [
        { id: 'b1', date: new Date().toISOString(), sizeMb: 245, status: 'Completed' },
        { id: 'b2', date: new Date(Date.now() - 86400000).toISOString(), sizeMb: 242, status: 'Completed' }
      ],
      auditLogs: [
        { id: 'al1', timestamp: new Date().toISOString(), user: 'admin@ajr.dev', action: 'Updated Policy', resource: 'API Rate Limits', ip: '10.0.0.1' },
        { id: 'al2', timestamp: new Date(Date.now() - 3600000).toISOString(), user: 'System', action: 'Auto-Scaling', resource: 'Database Pool', ip: 'internal' }
      ],
      plugins: [
        { id: 'p1', name: 'Advanced Analytics', type: 'Monitoring', enabled: true, status: 'Active' },
        { id: 'p2', name: 'Stripe Billing', type: 'Payments', enabled: true, status: 'Active' }
      ],
      billing: {
        plan: 'Pro Plan',
        currentSpend: 145.50,
        estimatedSpend: 299.00,
        apiCalls: 45200,
        apiLimit: 100000,
        storageGb: 42,
        storageLimit: 50
      }
    },
    {
      id: 'app_2',
      name: 'Internal Tools',
      domain: 'internal.ajr.dev',
      status: 'deploying',
      plan: 'Enterprise',
      apiUsage: 1205,
      lastUpdated: new Date().toISOString(),
      environment: 'Staging',
      features: { marketplace: false, services: false, analytics: true },
      apiKey: 'sk_test_def456...',
      policies: {
        api: { rpmLimit: 5000, rpHourLimit: 250000, allowedOrigins: 'internal.ajr.dev', ipWhitelist: '10.0.0.1', endpointLimits: [] },
        security: { authRequired: true, tokenExpiryMinutes: 120, accessRoles: 'admin', geoRestrictions: 'Internal', sessionLimits: 1 },
        usage: { maxDailyCalls: 1000000, maxUsers: 500, storageLimitGb: 200 }
      },
      logs: [
        { id: '1', timestamp: new Date().toISOString(), type: 'Deploy', severity: 'Info', message: 'Build started' },
        { id: '2', timestamp: new Date(Date.now() - 50000).toISOString(), type: 'API', severity: 'Warning', message: 'Rate limit tripped on /api/sync' }
      ],
      users: [],
      apiKeys: [],
      alerts: [],
      backups: [],
      auditLogs: [],
      plugins: [],
      billing: {
        plan: 'Enterprise',
        currentSpend: 2000,
        estimatedSpend: 2000,
        apiCalls: 1205,
        apiLimit: 1000000,
        storageGb: 10,
        storageLimit: 200
      }
    },
    {
      id: 'app_3',
      name: 'Legacy CRM',
      domain: 'crm.ajr.io',
      status: 'failed',
      plan: 'Starter',
      apiUsage: 0,
      lastUpdated: new Date().toISOString(),
      environment: 'Production',
      features: { marketplace: false, services: true, analytics: false },
      apiKey: 'sk_live_ghi789...',
      policies: {
        api: { rpmLimit: 100, rpHourLimit: 5000, allowedOrigins: '*', ipWhitelist: '', endpointLimits: [] },
        security: { authRequired: true, tokenExpiryMinutes: 15, accessRoles: 'crm_user', geoRestrictions: '', sessionLimits: 10 },
        usage: { maxDailyCalls: 10000, maxUsers: 100, storageLimitGb: 10 }
      },
      logs: [
        { id: '1', timestamp: new Date().toISOString(), type: 'Error', severity: 'Critical', message: 'Database connection timeout' },
        { id: '2', timestamp: new Date(Date.now() - 50000).toISOString(), type: 'Deploy', severity: 'Critical', message: 'Deploy failed' }
      ],
      users: [],
      apiKeys: [],
      alerts: [],
      backups: [],
      auditLogs: [],
      plugins: [],
      billing: {
        plan: 'Starter',
        currentSpend: 0,
        estimatedSpend: 0,
        apiCalls: 0,
        apiLimit: 10000,
        storageGb: 0,
        storageLimit: 10
      }
    }
  ]);

  websiteConfig = signal<WebsiteConfig>({
    siteName: 'AJR Digital Hub',
    logoUrl: '',
    theme: 'light',
    globalFeatures: { maintenanceMode: false, userRegistration: true },
    features: { marketplace: true, services: true, analytics: true }
  });

  rateLimiter = signal<RateLimiterConfig>({
    rpm: 1000,
    rph: 50000,
    burst: 200,
    enabled: true,
    status: 'safe'
  });

  staticAnalytics = signal<StaticAnalytics>({
    apiUsage: [
      { date: 'Mon', requests: 12000 },
      { date: 'Tue', requests: 15500 },
      { date: 'Wed', requests: 14200 },
      { date: 'Thu', requests: 18000 },
      { date: 'Fri', requests: 22000 },
      { date: 'Sat', requests: 19500 },
      { date: 'Sun', requests: 15000 }
    ],
    errors: 24,
    activeUsers: 1420,
    totalRequests: 116200
  });

  currentProjectId = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  toast = signal<AppToast>({ message: '', type: 'success', visible: false });

  // Computed signals
  apps = computed<AdminApp[]>(() => this.projects() as AdminApp[]);

  currentProject = computed<ProjectData | null>(() => {
    const id = this.currentProjectId();
    if (!id) return null;
    return this.projects().find(p => p.id === id) || null;
  });

  // Actions
  showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
    this.toast.set({ message, type, visible: true });
    setTimeout(() => {
      this.toast.update(t => ({ ...t, visible: false }));
    }, 4000);
  }

  loadProject(id: string) {
    this.isLoading.set(true);
    // Directly setting the active project ID triggers the currentProject computed signal!
    this.currentProjectId.set(id);
    setTimeout(() => {
      this.isLoading.set(false);
    }, 400); // Simulate network latency
  }

  updateProject(id: string, partial: Partial<ProjectData>): Observable<boolean> {
    return of(true).pipe(
      delay(500),
      tap(() => {
        this.projects.update(projects =>
          projects.map(p => {
            if (p.id === id) {
              const updated = { ...p, ...partial, lastUpdated: new Date().toISOString() };
              return updated;
            }
            return p;
          })
        );
        this.showToast(`Saved changes for ${this.projects().find(p => p.id === id)?.name || 'Project'} successfully!`, 'success');
      })
    );
  }

  updateAppConfig(id: string, updates: Partial<AdminApp>): Observable<boolean> {
    return of(true).pipe(
      delay(600),
      tap(() => {
        this.projects.update(projects =>
          projects.map(p => {
            if (p.id === id) {
              const updated = { ...p, ...updates, lastUpdated: new Date().toISOString() };
              return updated;
            }
            return p;
          })
        );
        this.showToast('Setup changed successfully!', 'success');
      })
    );
  }

  regenerateApiKey(id: string): Observable<string> {
    const newKey = 'sk_' + (Math.random() > 0.5 ? 'live' : 'test') + '_' + Math.random().toString(36).substring(2, 10);
    return of(newKey).pipe(
      delay(800),
      tap((key) => {
        this.projects.update(projects =>
          projects.map(p => {
            if (p.id === id) {
              return { ...p, apiKey: key, lastUpdated: new Date().toISOString() };
            }
            return p;
          })
        );
        this.showToast('Root API Key rotated successfully!', 'info');
      })
    );
  }

  updateWebsiteConfig(config: WebsiteConfig): Observable<boolean> {
    return of(true).pipe(
      delay(500),
      tap(() => {
        this.websiteConfig.set(config);
        this.showToast('Website configuration updated!', 'success');
      })
    );
  }

  updateRateLimiter(config: RateLimiterConfig): Observable<boolean> {
    const status = config.rpm > 5000 ? 'critical' : config.rpm > 2000 ? 'warning' : 'safe';
    return of(true).pipe(
      delay(400),
      tap(() => {
        this.rateLimiter.set({ ...config, status });
        this.showToast('Edge Rate Engine policies deployed!', 'success');
      })
    );
  }

  refreshDeployStatus(id: string): Observable<string> {
    return of('live').pipe(
      delay(1200),
      tap(() => {
        this.projects.update(projects =>
          projects.map(p => {
            if (p.id === id) {
              return { ...p, status: 'live', lastUpdated: new Date().toISOString() };
            }
            return p;
          })
         );
        this.showToast('Deployment status updated to active.', 'info');
      })
    );
  }

  addProject(newProj: { name: string; domain: string; environment: 'Production' | 'Staging' | 'Sandbox'; plan: 'Lite' | 'Standard' | 'Enterprise'; billing: any }) {
    const id = 'app_' + (this.projects().length + 1);
    const fullProject: ProjectData = {
      id,
      name: newProj.name,
      domain: newProj.domain,
      environment: newProj.environment,
      plan: newProj.plan,
      status: 'live',
      lastUpdated: new Date().toISOString(),
      apiUsage: 0,
      apiKey: 'sk_live_' + Math.random().toString(36).substring(2, 10),
      apiKeys: [],
      logs: [],
      auditLogs: [],
      users: [
        { id: 'u_1', name: 'Master Admin', email: 'admin@ajr.dev', role: 'Owner', status: 'Active', lastActive: new Date().toISOString() }
      ],
      backups: [],
      alerts: [],
      plugins: [],
      policies: {
        api: { rpmLimit: 1000, rpHourLimit: 60000, allowedOrigins: 'http://localhost:3000', ipWhitelist: '', endpointLimits: [] },
        security: { authRequired: true, tokenExpiryMinutes: 60, sessionLimits: 5, geoRestrictions: 'None', accessRoles: 'Administrator, Developer' },
        usage: { maxDailyCalls: 100000, maxUsers: 1000, storageLimitGb: 20 }
      },
      features: {
        marketplace: true,
        services: true,
        analytics: true
      },
      billing: newProj.billing
    };
    
    this.projects.update(list => [...list, fullProject]);
    this.showToast(`Application '${newProj.name}' provisioned successfully!`, 'success');
  }
}
