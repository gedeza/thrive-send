"use client"

import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode 
} from 'react';

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const defaultContext: AuthContextType = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulating getting the user from localStorage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('thrivesend_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Simulate a login
  const login = async (email: string, password: string) => {
    // In a real implementation, this would call your API
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Hardcoded demo user for now
      const mockUser: User = {
        id: '1',
        email,
        name: 'ThriveSend User',
        role: 'admin',
      };
      
      setUser(mockUser);
      localStorage.setItem('thrivesend_user', JSON.stringify(mockUser));
    } catch (error) {
      // Login failed
      throw new Error('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate a logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('thrivesend_user');
    // In a real app, you might redirect here
    window.location.href = '/login';
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};