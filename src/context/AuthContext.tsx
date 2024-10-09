import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface Authority {
    authority: string;
}

interface DecodedToken {
    sub: string;
    username: string;
    authorities: Authority[];
    iat: number;
    exp: number;
}

interface AuthContextType {
    user: DecodedToken | null;
    loading: boolean;
    isAuthenticated: boolean;
    userRole: string | null;
    login: (token: string, authorities: Authority[]) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<DecodedToken | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const authorities = localStorage.getItem('authorities');

        if (token && authorities) {
            try {
                const decodedToken = jwtDecode<DecodedToken>(token); // Decode the JWT
                const parsedAuthorities = JSON.parse(authorities);

                setUser({ ...decodedToken, authorities: parsedAuthorities });
                setUserRole(parsedAuthorities[0]?.authority.replace("ROLE_", "") || null);
            } catch (error) {
                console.error("Failed to parse token or authorities:", error);
                localStorage.removeItem('token');
                localStorage.removeItem('authorities');
                setUser(null);
                setUserRole(null);
            }
        }

        setLoading(false);
    }, []);

    const login = (token: string, authorities: Authority[]) => {
        localStorage.setItem('token', token);
        localStorage.setItem('authorities', JSON.stringify(authorities));

        try {
            const decodedToken = jwtDecode<DecodedToken>(token);
            setUser({ ...decodedToken, authorities });
            setUserRole(authorities[0].authority.replace("ROLE_", ""));
        } catch (error) {
            console.error("Failed to decode login token:", error);
            setUser(null);
            setUserRole(null);
        }

        setLoading(false);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('authorities');
        setUser(null);
        setUserRole(null);
        setLoading(false);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, userRole, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};