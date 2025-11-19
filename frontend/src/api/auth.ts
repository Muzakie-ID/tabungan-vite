import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const authAPI = {
  register: (email: string, name: string, password: string) =>
    axios.post(`${API_URL}/auth/register`, { email, name, password }),
  
  login: (email: string, password: string) =>
    axios.post(`${API_URL}/auth/login`, { email, password }),
  
  getCurrentUser: (token: string) =>
    axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
};

export const goalsAPI = {
  createGoal: (data: any, token: string) =>
    axios.post(`${API_URL}/goals`, data, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  getGoals: (token: string) =>
    axios.get(`${API_URL}/goals`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  getGoal: (id: string, token: string) =>
    axios.get(`${API_URL}/goals/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  updateGoal: (id: string, data: any, token: string) =>
    axios.put(`${API_URL}/goals/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  deleteGoal: (id: string, token: string) =>
    axios.delete(`${API_URL}/goals/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  addTransaction: (goalId: string, data: any, token: string) =>
    axios.post(`${API_URL}/goals/${goalId}/transactions`, data, {
      headers: { Authorization: `Bearer ${token}` }
    }),
};

export const sharedGoalsAPI = {
  createSharedGoal: (data: any, token: string) =>
    axios.post(`${API_URL}/shared-goals`, data, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  getSharedGoals: (token: string) =>
    axios.get(`${API_URL}/shared-goals`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  getInvitations: (token: string) =>
    axios.get(`${API_URL}/shared-goals/invitations`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  acceptInvitation: (invitationId: string, token: string) =>
    axios.post(`${API_URL}/shared-goals/invitations/${invitationId}/accept`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  rejectInvitation: (invitationId: string, token: string) =>
    axios.post(`${API_URL}/shared-goals/invitations/${invitationId}/reject`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }),
};
