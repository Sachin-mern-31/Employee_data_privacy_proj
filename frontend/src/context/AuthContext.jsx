import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginApi, registerApi, getMeApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                try {
                    const response = await getMeApi();
                    setUser(response.data);
                } catch (error) {
                    // Stale or invalid token, quietly clear session
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        };
        fetchUser();
    }, [token]);

    const login = async (email, password) => {
        const response = await loginApi({ email, password });
        const { token: newToken, ...userData } = response.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const register = async (userData) => {
        const response = await registerApi(userData);
        const { token: newToken, ...userPayload } = response.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userPayload);
        return userPayload;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const isHRManager = user?.role === 'HR_MANAGER' || isSuperAdmin;
    const isEmployee = user?.role === 'EMPLOYEE';

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                register,
                logout,
                isSuperAdmin,
                isHRManager,
                isEmployee
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
