import apiClient from '@/lib/api';

export const authService = {
  login: async (formData: FormData) => {
    // API đăng nhập yêu cầu content type form-data
    const response = await apiClient.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data;
  },

  register: async (userData: any) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  googleLogin: async (credential: string) => {
    const response = await apiClient.post('/auth/google-login', { credential });
    return response.data;
  },

  updateProfile: async (name: string) => {
    const response = await apiClient.put('/auth/me', { name });
    return response.data;
  },

  changePassword: async (passwordData: any) => {
    const response = await apiClient.put('/auth/change-password', passwordData);
    return response.data;
  },

  resetPassword: async (resetData: any) => {
    const response = await apiClient.post('/auth/reset-password', resetData);
    return response.data;
  }
};
