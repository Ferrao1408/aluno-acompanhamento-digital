
import React, { createContext, useState, useEffect, useContext } from "react";

// Define the user types
export type UserRole = "coordinator" | "teacher" | "admin" | "busca_ativa";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

// Define the context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for development (to be replaced with real authentication)
const mockUsers: User[] = [
  {
    id: "1",
    name: "Coordenador Escolar",
    email: "coordenador@escola.edu.br",
    role: "coordinator",
    avatarUrl: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: "2",
    name: "Professor Silva",
    email: "professor@escola.edu.br",
    role: "teacher",
    avatarUrl: "https://i.pravatar.cc/150?img=2",
  },
  {
    id: "3",
    name: "Equipe Busca Ativa",
    email: "buscaativa@escola.edu.br",
    role: "busca_ativa",
    avatarUrl: "https://i.pravatar.cc/150?img=3",
  },
  {
    id: "4",
    name: "Administrador Sistema",
    email: "admin@escola.edu.br",
    role: "admin",
    avatarUrl: "https://i.pravatar.cc/150?img=4",
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in - use sessionStorage instead of localStorage
  // to prevent issues across multiple tabs/windows
  useEffect(() => {
    const storedUser = sessionStorage.getItem("userData");
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
        sessionStorage.removeItem("userData");
      }
    }
    
    setLoading(false);
  }, []);

  // Mock login function (to be replaced with real API call)
  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const foundUser = mockUsers.find(u => u.email === email);
      
      if (!foundUser) {
        throw new Error("Usuário não encontrado");
      }
      
      setUser(foundUser);
      sessionStorage.setItem("userData", JSON.stringify(foundUser));
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Mock Google login
  const loginWithGoogle = async () => {
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, just login as coordinator
      const coordUser = mockUsers[0];
      
      setUser(coordUser);
      sessionStorage.setItem("userData", JSON.stringify(coordUser));
    } catch (error) {
      console.error("Google login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("userData");
  };

  // Create a stable context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    user,
    isAuthenticated: !!user,
    loading,
    login,
    loginWithGoogle,
    logout
  }), [user, loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};
