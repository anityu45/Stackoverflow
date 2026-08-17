import React, { createContext, useContext, useState } from "react";
import { toast } from "react-toastify";

import axiosInstance from "./axiosinstance";

type User = {
  _id: string;
  name: string;
  email?: string;
  token?: string;
  about?: string;
  tags?: string[];
};

type AuthCredentials = {
  email: string;
  password: string;
};

type SignupPayload = AuthCredentials & {
  name: string;
};

type AuthContextValue = {
  user: User | null;
  Signup: (payload: SignupPayload) => Promise<void>;
  Login: (payload: AuthCredentials) => Promise<void>;
  Logout: () => void;
  loading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getStoredUser = () => {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem("user");
    return stored ? (JSON.parse(stored) as User) : null;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const Signup = async ({ name, email, password }: SignupPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.post("/user/signup", {
        name,
        email,
        password,
      });
      const { data, token } = res.data;
      const nextUser = { ...data, token };
      localStorage.setItem("user", JSON.stringify(nextUser));
      setUser(nextUser);
      toast.success("Signup successful");
    } catch (err: any) {
      const message = err.response?.data?.message || "Signup failed";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const Login = async ({ email, password }: AuthCredentials) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.post("/user/login", {
        email,
        password,
      });
      const { data, token } = res.data;
      const nextUser = { ...data, token };
      localStorage.setItem("user", JSON.stringify(nextUser));
      setUser(nextUser);
      toast.success("Login successful");
    } catch (err: any) {
      const message = err.response?.data?.message || "Login failed";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const Logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.info("Logged out");
  };

  return (
    <AuthContext.Provider value={{ user, Signup, Login, Logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
