"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";
import { User, AuthContextType } from "@/types";
import { bookmarkService } from "@/services/bookmarkService";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBookmarks = async () => {
    const ids = await bookmarkService.getBookmarkedIds();
    setBookmarkedIds(ids);
  };

  useEffect(() => {
    // Attempt to load token and user from local storage / cookies on mount
    const savedToken = Cookies.get("access_token");
    const savedUser = localStorage.getItem("user");
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        loadBookmarks(); // fetch bookmarks on mount if user is logged in
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User, rememberMe: boolean = false) => {
    setToken(newToken);
    setUser(newUser);
    if (rememberMe) {
      Cookies.set("access_token", newToken, { expires: 30 }); // 30 days
    } else {
      Cookies.set("access_token", newToken); // Session cookie (expires on close)
    }
    localStorage.setItem("user", JSON.stringify(newUser));
    loadBookmarks(); // fetch bookmarks on login
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setBookmarkedIds([]);
    Cookies.remove("access_token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const toggleBookmarkState = (id: number) => {
    setBookmarkedIds(prev => 
      prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id]
    );
  };

  return (
    <AuthContext.Provider value={{ user, token, bookmarkedIds, login, logout, updateUser, toggleBookmarkState, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
