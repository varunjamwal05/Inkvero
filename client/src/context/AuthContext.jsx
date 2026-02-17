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

            try {
                // Just hit /me or /time endpoint, or rely on cookie being sent automatically
                // But original logic called /auth/refresh to get new access token.
                // With cookie-only flow, we just need to verify session.
                // We'll call /auth/me instead of refresh, as refresh is for rotating tokens.
                // Or if we need to refresh the cookie, call refresh.
                // Let's call refresh to ensure cookie is valid/rotated if needed, but we don't need the data.
                await api.get('/auth/refresh');

                // Get user details
                const meRes = await api.get('/auth/me');
                setUser(meRes.data.data);
            } catch (err) {
                // Token invalid or expired
                console.log('Session expired or invalid, clearing auth state.');
                localStorage.removeItem('hasSession');
                setUser(null);
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('hasSession', 'true');
        setUser(data.data);
        return data;
    };

    const register = async (username, email, password) => {
        const { data } = await api.post('/auth/register', { username, email, password });
        localStorage.setItem('hasSession', 'true');
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
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
