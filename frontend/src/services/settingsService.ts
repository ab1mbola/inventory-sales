import { api } from './api';

export interface CompanySettings {
  id: string;
  name: string;
  logo: string | null;
  copyrightText: string | null;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const settingsService = {
  getCompany: async (): Promise<CompanySettings> => {
    const res = await api.get('/settings/company');
    return res.data;
  },

  updateCompany: async (data: Partial<CompanySettings>): Promise<CompanySettings> => {
    const res = await api.put('/settings/company', data);
    return res.data;
  },

  updateProfile: async (data: { name: string; email: string }): Promise<UserProfile> => {
    const res = await api.put('/settings/profile', data);
    return res.data;
  },

  changePassword: async (data: { oldPassword: string; newPassword: string }): Promise<{ message: string }> => {
    const res = await api.put('/settings/password', data);
    return res.data;
  },
};
