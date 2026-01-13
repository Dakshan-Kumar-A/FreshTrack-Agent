import axios from 'axios';
import { supabase } from './supabase';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: apiUrl,
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export interface FoodItem {
  id: string;
  user_id: string;
  name: string;
  quantity: string;
  expiry_date: string;
  status: 'safe' | 'expiring' | 'expired';
  created_at: string;
  updated_at: string;
}

export interface FoodItemCreate {
  name: string;
  quantity: string;
  expiry_date: string;
}

export interface AgentLog {
  id: string;
  user_id: string;
  action: string;
  reasoning: string;
  created_at: string;
}

export interface Insights {
  total_items: number;
  safe: number;
  expiring: number;
  expired: number;
  waste_count: number;
  recent_recommendations: AgentLog[];
}

export const foodApi = {
  getAll: async (): Promise<FoodItem[]> => {
    const response = await api.get<FoodItem[]>('/food');
    return response.data;
  },
  
  create: async (food: FoodItemCreate): Promise<FoodItem> => {
    const response = await api.post<FoodItem>('/food', food);
    return response.data;
  },
  
  update: async (id: string, food: Partial<FoodItemCreate>): Promise<FoodItem> => {
    const response = await api.put<FoodItem>(`/food/${id}`, food);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/food/${id}`);
  },
};

export const agentApi = {
  getLogs: async (): Promise<AgentLog[]> => {
    const response = await api.get<AgentLog[]>('/agent/logs');
    return response.data;
  },
  
  getInsights: async (): Promise<Insights> => {
    const response = await api.get<Insights>('/insights');
    return response.data;
  },
};
