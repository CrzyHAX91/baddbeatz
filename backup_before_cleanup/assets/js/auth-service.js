// Authentication Service for BaddBeatz
class AuthService {
    constructor() {
        this.baseURL = window.location.hostname === 'localhost' 
            ? 'http://localhost:3001/api/auth' 
            : 'https://api.baddbeatz.com/api/auth';
        this.token = localStorage.getItem('authToken');
    }

    // Register new user
    async register(username, email, password) {
        try {
            const response = await fetch(`${this.baseURL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            return { success: true, message: data.message };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message };
        }
    }

    // Login user
    async login(email, password) {
        try {
            const response = await fetch(`${this.baseURL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Store token and user info
            this.token = data.token;
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            return { success: true, user: data.user };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }

    // Verify token
    async verifyToken() {
        if (!this.token) {
            return { valid: false };
        }

        try {
            const response = await fetch(`${this.baseURL}/verify`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();
            
            if (!response.ok) {
                this.logout();
                return { valid: false };
            }

            return { valid: true, user: data.user };
        } catch (error) {
            console.error('Token verification error:', error);
            this.logout();
            return { valid: false };
        }
    }

    // Logout user
    async logout() {
        try {
            if (this.token) {
                await fetch(`${this.baseURL}/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local storage
            this.token = null;
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            
            // Redirect to login
            window.location.href = '/login.html';
        }
    }

    // Get current user
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.token;
    }

    // Get auth headers for API requests
    getAuthHeaders() {
        return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
    }

    // Protected route guard
    async requireAuth() {
        const result = await this.verifyToken();
        if (!result.valid) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    }
}

// Create singleton instance
const authService = new AuthService();

// Auto-verify token on page load for protected pages
if (window.location.pathname.includes('dashboard') || 
    window.location.pathname.includes('admin')) {
    authService.requireAuth();
}

// Export for use in other modules
window.AuthService = authService;
