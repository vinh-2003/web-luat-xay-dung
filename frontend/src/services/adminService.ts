import apiClient from "@/lib/api";

export const adminService = {
  getStats: async () => {
    const res = await apiClient.get('/admin/stats');
    return res.data;
  },
  getUsers: async (skip: number = 0, limit: number = 10, search: string = "", sortBy: string = "created_at", order: string = "desc") => {
    const params: any = { skip, limit, sort_by: sortBy, order };
    if (search) params.search = search;
    
    const res = await apiClient.get('/admin/users', { params });
    return res.data;
  },
  toggleUserStatus: async (userId: number) => {
    const res = await apiClient.put(`/admin/users/${userId}/status`);
    return res.data;
  },
  changeUserRole: async (userId: number, role: string) => {
    const res = await apiClient.put(`/admin/users/${userId}/role`, null, { params: { role } });
    return res.data;
  },
  createUser: async (userData: { name: string; email: string; role: string }) => {
    const res = await apiClient.post('/admin/users', userData);
    return res.data;
  },
  resetUserPassword: async (userId: number) => {
    const res = await apiClient.post(`/admin/users/${userId}/reset-password`);
    return res.data;
  },
  getDocuments: async (
    skip: number = 0, 
    limit: number = 50, 
    search: string = "", 
    document_type: string = "", 
    status: string = "", 
    sort_by: string = "issue_date", 
    order: string = "desc"
  ) => {
    const params: any = { skip, limit, sort_by, order };
    if (search) params.search = search;
    if (document_type) params.document_type = document_type;
    if (status) params.status = status;
    
    const res = await apiClient.get('/admin/documents', { params });
    return res.data;
  },
  updateDocument: async (docId: number, data: any) => {
    const res = await apiClient.put(`/admin/documents/${docId}`, data);
    return res.data;
  },
  deleteDocument: async (docId: number) => {
    const res = await apiClient.delete(`/admin/documents/${docId}`);
    return res.data;
  },
  getDocumentFilters: async () => {
    const res = await apiClient.get('/admin/documents/filters');
    return res.data;
  },
  
  // Crawler / Scraper
  triggerScraper: async (payload: { source: string, mode: string, timeout_minutes: number }) => {
    const res = await apiClient.post('/admin/scraper/run', payload);
    return res.data;
  },
  pauseScraper: async (jobId: number) => {
    const res = await apiClient.post(`/admin/scraper/${jobId}/pause`);
    return res.data;
  },
  resumeScraper: async (jobId: number) => {
    const res = await apiClient.post(`/admin/scraper/${jobId}/resume`);
    return res.data;
  },
  stopScraper: async (jobId: number) => {
    const res = await apiClient.post(`/admin/scraper/${jobId}/stop`);
    return res.data;
  },
  getScraperStatus: async () => {
    const res = await apiClient.get('/admin/scraper/status');
    return res.data;
  },
  getScraperHistory: async (skip: number = 0, limit: number = 10) => {
    const res = await apiClient.get('/admin/scraper/history', { params: { skip, limit } });
    return res.data;
  },
  getSchedules: async () => {
    const res = await apiClient.get('/admin/scraper/schedules');
    return res.data;
  },
  saveSchedule: async (payload: { source: string, mode: string, cron_expression: string, is_active: boolean }) => {
    const res = await apiClient.post('/admin/scraper/schedules', payload);
    return res.data;
  }
};
