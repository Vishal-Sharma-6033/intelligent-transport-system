const API_BASE = '/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('transit_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'An unexpected error occurred');
  }
  return data;
};

export const api = {
  // Auth
  auth: {
    login: async (credentials) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return handleResponse(res);
    },
    register: async (userData) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return handleResponse(res);
    },
    getMe: async () => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    }
  },

  // Stops
  stops: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/stops${query ? `?${query}` : ''}`);
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE}/stops/${id}`);
      return handleResponse(res);
    },
    create: async (data) => {
      const res = await fetch(`${API_BASE}/stops`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    update: async (id, data) => {
      const res = await fetch(`${API_BASE}/stops/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE}/stops/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    }
  },

  // Routes
  routes: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/routes`);
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE}/routes/${id}`);
      return handleResponse(res);
    },
    create: async (data) => {
      const res = await fetch(`${API_BASE}/routes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    update: async (id, data) => {
      const res = await fetch(`${API_BASE}/routes/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE}/routes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    getStops: async (id) => {
      const res = await fetch(`${API_BASE}/routes/${id}/stops`);
      return handleResponse(res);
    }
  },

  // Graph Engine
  network: {
    getGraph: async () => {
      const res = await fetch(`${API_BASE}/network/graph`);
      return handleResponse(res);
    },
    getConnectivity: async () => {
      const res = await fetch(`${API_BASE}/network/connectivity`);
      return handleResponse(res);
    }
  },

  // Shortest Path & Route Optimization
  optimize: {
    route: async ({ sourceStopId, targetStopId, criteria }) => {
      const res = await fetch(`${API_BASE}/optimize/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceStopId, targetStopId, criteria })
      });
      return handleResponse(res);
    },
    alternatives: async ({ sourceStopId, targetStopId }) => {
      const res = await fetch(`${API_BASE}/optimize/alternatives`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceStopId, targetStopId })
      });
      return handleResponse(res);
    },
    schedule: async (data) => {
      const res = await fetch(`${API_BASE}/optimize/schedule`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    network: async (weights) => {
      const res = await fetch(`${API_BASE}/optimize/network`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ weights })
      });
      return handleResponse(res);
    },
    getReport: async () => {
      const res = await fetch(`${API_BASE}/optimize/report`);
      return handleResponse(res);
    }
  },

  // Demand Analytics
  analytics: {
    getDemand: async () => {
      const res = await fetch(`${API_BASE}/analytics/demand`);
      return handleResponse(res);
    },
    getPeakHours: async () => {
      const res = await fetch(`${API_BASE}/analytics/peak-hours`);
      return handleResponse(res);
    },
    getStops: async () => {
      const res = await fetch(`${API_BASE}/analytics/stops`);
      return handleResponse(res);
    },
    getWaitingTime: async () => {
      const res = await fetch(`${API_BASE}/analytics/waiting-time`);
      return handleResponse(res);
    }
  },

  // Schedules
  schedules: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/schedules`);
      return handleResponse(res);
    },
    create: async (data) => {
      const res = await fetch(`${API_BASE}/schedules`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE}/schedules/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    }
  },

  // AI & ML Demand Forecast
  ai: {
    predictDemand: async (params) => {
      const res = await fetch(`${API_BASE}/ai/predict-demand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      return handleResponse(res);
    },
    getModelMetrics: async () => {
      const res = await fetch(`${API_BASE}/ai/model-metrics`);
      return handleResponse(res);
    }
  },

  // Live Vehicle Tracking
  buses: {
    getLocations: async () => {
      const res = await fetch(`${API_BASE}/buses/locations`);
      return handleResponse(res);
    },
    getLocation: async (id) => {
      const res = await fetch(`${API_BASE}/buses/${id}/location`);
      return handleResponse(res);
    },
    updateLocation: async (id, data) => {
      const res = await fetch(`${API_BASE}/buses/${id}/location`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    getStopArrivals: async (stopId) => {
      const res = await fetch(`${API_BASE}/stops/${stopId}/arrivals`);
      return handleResponse(res);
    }
  },

  // Dashboard Summary & Performance
  dashboard: {
    getSummary: async () => {
      const res = await fetch(`${API_BASE}/dashboard/summary`);
      return handleResponse(res);
    },
    getRoutes: async () => {
      const res = await fetch(`${API_BASE}/dashboard/routes`);
      return handleResponse(res);
    },
    getPerformance: async () => {
      const res = await fetch(`${API_BASE}/dashboard/performance`);
      return handleResponse(res);
    }
  },

  // System Health
  health: {
    getDetailed: async () => {
      const res = await fetch(`${API_BASE}/health/detailed`);
      return handleResponse(res);
    },
    getMetrics: async () => {
      const res = await fetch(`${API_BASE}/metrics`);
      return handleResponse(res);
    }
  }
};
