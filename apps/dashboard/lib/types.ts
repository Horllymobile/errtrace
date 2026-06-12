export interface ErrorLog {
  id: string;
  message: string;
  stack_trace: string;
  level: 'error' | 'warning' | 'info' | 'debug';
  environment: string;
  url: string;
  user_agent: string;
  ip_address: string;
  metadata: any;
  created_at: string;
  resolved: number;        // 0 or 1
  project?: string;
  release?: string;
  tags?: string[];
}

export interface ErrorStats {
  total: number
  unresolved: number
  today: number
  by_level: Array<{ level: string; count: number }>
  recent_errors: ErrorLog[]
}

export interface PaginatedResponse {
  errors: ErrorLog[]
  pagination: {
    total: number
    limit: number
    offset: number
    has_more: boolean
  }
}

export interface ErrTraceConfig {
  apiKey?: string
  environment?: string
  release?: string
  tags?: string[]
}

export interface ErrTraceStats {
  total: number;
  unresolved: number;
  today: number;
  by_level: Array<{ level: string; count: number }>;
  recent_errors: ErrorLog[];
}

// Add to your existing types
export interface TrackErrTraceEvent {
  id: string;
  name: string;
  properties: Record<string, any>;
  timestamp: string;
  user?: {
    id?: string;
    email?: string;
    username?: string;
  };
  tags?: string[];
  environment: string;
  release?: string;
}

export interface EventLog {
  id?: string;
  name: string;
  url?: string;
  metadata?: string | Record<string, any>;
  created_at?: string;
}
