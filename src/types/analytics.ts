export interface SiteVisit {
  id: string;
  ip_address: string;
  page_path: string;
  user_agent?: string;
  visit_date: string;
  user_id?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "completed" | "canceled";
  priority: "low" | "medium" | "high" | "urgent";
  due_date?: string;
  completed_date?: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  created_by?: string;
}

export interface DashboardStats {
  visits: {
    total: number;
    today: number;
    yesterday: number;
    changePercent: number;
    last7d?: number;
  };
  projects: {
    total: number;
    published: number;
    drafts?: number;
    pendingModeration?: number;
    byCategory: { name: string; value: number }[];
  };
  tasks: {
    total: number;
    completed: number;
    overdue?: number;
    pendingByPriority: Record<string, number>;
    completionRate: number;
  };
  forms?: {
    total: number;
    new: number;
    inProgress: number;
    today: number;
  };
  users?: {
    total: number;
    new30d: number;
  };
}
