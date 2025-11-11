export interface DashboardOverview {
  tasks: {
    total: number;
    completed: number;
    pending: number;
    in_progress: number;
    overdue: number;
  };
  meetings: {
    total: number;
    upcoming: number;
    today: number;
  };
  contracts: {
    total: number;
    active: number;
    completed: number;
  };
  quotations: {
    total: number;
    draft: number;
    sent: number;
    accepted: number;
  };
  clients: {
    total: number;
    active: number;
  };
  leads: {
    total: number;
    new: number;
    qualified: number;
    converted: number;
  };
  performance: {
    completion_rate: number;
    workload_percentage: number;
    active_tasks: number;
  };
}

export interface DashboardOverviewResponse {
  success: boolean;
  data: DashboardOverview;
}

