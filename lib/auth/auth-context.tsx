"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthUser, UserRole } from "./types";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  hasPermission: (permission: string) => boolean;
  isLoading: boolean;
}

const DEFAULT_USERS: Record<UserRole, AuthUser> = {
  ADMIN: {
    id: "usr-admin",
    name: "Rahul Sharma (Admin)",
    email: "admin@purchaseflow.com",
    role: "ADMIN",
    phone: "+91 98200 11223",
  },
  PURCHASE_MANAGER: {
    id: "usr-mgr",
    name: "Priya Nair (Purchase Manager)",
    email: "manager@purchaseflow.com",
    role: "PURCHASE_MANAGER",
    phone: "+91 98200 22334",
  },
  PURCHASE_EXECUTIVE: {
    id: "usr-exec",
    name: "Amit Patel (Purchase Executive)",
    email: "executive@purchaseflow.com",
    role: "PURCHASE_EXECUTIVE",
    phone: "+91 98200 33445",
  },
  ACCOUNTS: {
    id: "usr-acc",
    name: "Sunita Deshmukh (Accounts)",
    email: "accounts@purchaseflow.com",
    role: "ACCOUNTS",
    phone: "+91 98200 44556",
  },
  STORE_MANAGER: {
    id: "usr-str",
    name: "Ramesh Gupta (Store Manager)",
    email: "store@purchaseflow.com",
    role: "STORE_MANAGER",
    phone: "+91 98200 55667",
  },
  DEPARTMENT_HEAD: {
    id: "usr-dept",
    name: "Rajesh Sharma (Dept Head)",
    email: "depthead@purchaseflow.com",
    role: "DEPARTMENT_HEAD",
    phone: "+91 98200 66778",
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(DEFAULT_USERS.ADMIN);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("purchaseflow_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        localStorage.setItem("purchaseflow_user", JSON.stringify(DEFAULT_USERS.ADMIN));
      }
    } catch {
      setUser(DEFAULT_USERS.ADMIN);
    }
  }, []);

  const login = (newUser: AuthUser) => {
    setUser(newUser);
    localStorage.setItem("purchaseflow_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("purchaseflow_user");
    router.push("/login");
  };

  const switchRole = (role: UserRole) => {
    const targetUser = DEFAULT_USERS[role] || DEFAULT_USERS.ADMIN;
    login(targetUser);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === "ADMIN") return true;
    
    // Check role specific mappings
    if (permission.startsWith("dashboard")) return true;
    if (permission.startsWith("purchase:")) {
      const sub = permission.replace("purchase:", "");
      if (user.role === "PURCHASE_MANAGER") return true;
      if (user.role === "PURCHASE_EXECUTIVE" && ["indent", "quotation", "vendor-selection", "po", "po-dispatch", "follow-up"].includes(sub)) return true;
      if (user.role === "ACCOUNTS" && ["payment", "po"].includes(sub)) return true;
      if (user.role === "STORE_MANAGER" && ["receipt", "stock", "returns"].includes(sub)) return true;
      if (user.role === "DEPARTMENT_HEAD" && ["indent", "approval", "po-approval"].includes(sub)) return true;
    }
    if (permission.startsWith("masters:")) {
      if (user.role === "PURCHASE_MANAGER") return true;
      if (user.role === "PURCHASE_EXECUTIVE" && ["vendors", "materials"].includes(permission.replace("masters:", ""))) return true;
      if (user.role === "ACCOUNTS" && ["vendors", "tax", "payment-terms"].includes(permission.replace("masters:", ""))) return true;
      if (user.role === "STORE_MANAGER" && ["materials", "warehouses"].includes(permission.replace("masters:", ""))) return true;
    }
    if (permission.startsWith("reports:")) {
      if (user.role === "PURCHASE_MANAGER") return true;
      if (user.role === "ACCOUNTS" && ["payment", "purchase-register"].includes(permission.replace("reports:", ""))) return true;
      if (user.role === "STORE_MANAGER" && ["material-receipt"].includes(permission.replace("reports:", ""))) return true;
    }
    if (permission.startsWith("administration:")) {
      return (user.role as string) === "ADMIN";
    }
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        switchRole,
        hasPermission,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
