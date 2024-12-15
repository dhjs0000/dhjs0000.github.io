const API_URL = 'http://localhost:3000/api';

class ApiService {
    static async register(userData) {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || '注册失败');
            }
            
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async login(credentials) {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || '登录失败');
            }
            
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async getCurrentUser() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('未登录');
            }

            const response = await fetch(`${API_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || '获取用户信息失败');
            }
            
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async updateUserDetails(details) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('未登录');
            }

            const response = await fetch(`${API_URL}/auth/updatedetails`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(details)
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || '更新用户信息失败');
            }
            
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async updatePassword(passwords) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('未登录');
            }

            const response = await fetch(`${API_URL}/auth/updatepassword`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(passwords)
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || '更新密码失败');
            }
            
            return data;
        } catch (error) {
            throw error;
        }
    }
} 