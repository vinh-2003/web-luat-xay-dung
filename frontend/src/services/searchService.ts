import apiClient from '@/lib/api';
import { SearchFilters, SearchResponse } from '@/types';

export const searchService = {
  getFilters: async () => {
    const response = await apiClient.get('/search/filters');
    return response.data;
  },

  searchDocuments: async (filters: SearchFilters, page: number = 1, pageSize: number = 10, sortBy: string = "relevance"): Promise<SearchResponse> => {
    const params: Record<string, any> = {
      page: page,
      page_size: pageSize,
      sort_by: sortBy
    };
    
    if (filters.query) params.query = filters.query;
    if (filters.doc_types.length > 0) params.doc_type = filters.doc_types.join(',');
    if (filters.statuses.length > 0) params.status_filter = filters.statuses.join(',');
    if (filters.issuing_bodies.length > 0) params.issuing_body = filters.issuing_bodies.join(',');
    if (filters.issue_date_from) params.issue_date_from = filters.issue_date_from;
    if (filters.issue_date_to) params.issue_date_to = filters.issue_date_to;
    if (filters.effective_date_from) params.effective_date_from = filters.effective_date_from;
    if (filters.effective_date_to) params.effective_date_to = filters.effective_date_to;

    const response = await apiClient.get('/search/', { params });
    return response.data;
  }
};
