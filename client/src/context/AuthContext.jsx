import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            // Optimization: users without a session marker don't need to hit the server
            // preventing the 401 console error for guests
            if (!localStorage.getItem('hasSession')) {
                setLoading(false);
                return;
            }

            // Try to use existing token first
            if (localStorage.getItem('accessToken')) {
                try {
                    const meRes = await api.get('/auth/me');
                    setUser(meRes.data.data);
                    setLoading(false);
                    return;
                } catch (err) {
                    // Token invalid/expired, try refresh below
                    console.log('Access token invalid, trying refresh...', err);
                }
            }

            try {
                // Try refresh (cookie-based)
                const refreshRes = await api.get('/auth/refresh');

                // If refresh returns a new token, store it!
                if (refreshRes.data?.accessToken) {
                    localStorage.setItem('accessToken', refreshRes.data.accessToken);
                } else if (refreshRes.data?.token) {
                    localStorage.setItem('accessToken', refreshRes.data.token);
                }

                // Get user details
                const meRes = await api.get('/auth/me');
                setUser(meRes.data.data);
            } catch (err) {
                // Token invalid or expired
                console.log('Session expired or invalid, clearing auth state.');
                localStorage.removeItem('hasSession');
                localStorage.removeItem('accessToken');
                setUser(null);
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('hasSession', 'true');
        if (data.token) {
            localStorage.setItem('accessToken', data.token);
        }
        setUser(data.data);
        return data;
    };

    const register = async (username, email, password) => {
        const { data } = await api.post('/auth/register', { username, email, password });
        localStorage.setItem('hasSession', 'true');
        if (data.token) {
            localStorage.setItem('accessToken', data.token);
        }
        setUser(data.data);
        return data;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error(error);
        }
        localStorage.removeItem('hasSession');
        localStorage.removeItem('accessToken');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
