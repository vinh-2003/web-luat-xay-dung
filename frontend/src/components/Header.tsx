"use client";

import { useState } from "react";
import { Scale, LogOut, User as UserIcon, Bookmark } from "lucide-react";
import Link from "next/link";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { user, logout, isLoading } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex w-full h-14 items-center px-6">
          <a href="/" className="flex items-center gap-2 font-bold text-primary">
            <Scale className="h-6 w-6" />
            <span>Luật Xây Dựng AI</span>
          </a>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-4">
              <ThemeSwitcher />

              {!isLoading && (
                <>
                  {user ? (
                    <div className="flex items-center space-x-3 h-9">
                      <div className="relative">
                        <button
                          onClick={() => {
                            setShowUserMenu(!showUserMenu);
                            setShowLogoutConfirm(false);
                          }}
                          id="tour-profile"
                          className={`flex items-center space-x-2 h-9 px-3 text-sm font-medium rounded-md transition-colors ${showUserMenu ? "bg-muted text-foreground border border-border" : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"}`}
                        >
                          <UserIcon className="w-4 h-4" />
                          <span>{user.name || user.email}</span>
                          {user.role === 'admin' && <span className="px-2 py-0.5 text-xs text-white bg-red-500 rounded-full">Admin</span>}
                        </button>
                        
                        {showUserMenu && (
                          <div className="absolute right-0 top-full mt-2 w-56 bg-card rounded-lg shadow-lg border border-border py-2 z-50 animate-in fade-in slide-in-from-top-2">
                            <Link 
                              href="/profile" 
                              onClick={() => setShowUserMenu(false)} 
                              className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                            >
                              <UserIcon className="w-4 h-4 text-primary" />
                              Thông tin tài khoản
                            </Link>
                            {user.role === 'admin' && (
                              <Link 
                                href="/admin" 
                                onClick={() => setShowUserMenu(false)} 
                                className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                              >
                                <Scale className="w-4 h-4 text-red-500" />
                                Quản trị hệ thống
                              </Link>
                            )}
                            <Link 
                              href="/bookmarks" 
                              onClick={() => setShowUserMenu(false)} 
                              className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                            >
                              <Bookmark className="w-4 h-4 text-primary" />
                              Văn bản đã lưu
                            </Link>
                          </div>
                        )}
                      </div>

                      <div className="h-4 w-px bg-border"></div>

                      <div className="relative">
                        <button
                          onClick={() => {
                            setShowLogoutConfirm(!showLogoutConfirm);
                            setShowUserMenu(false);
                          }}
                          className={`inline-flex items-center justify-center w-8 h-8 text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors ${showLogoutConfirm ? "bg-muted text-foreground" : ""}`}
                          title="Đăng xuất"
                        >
                          <LogOut className="w-4 h-4" />
                        </button>
                        
                        {showLogoutConfirm && (
                          <div className="absolute right-0 top-full mt-2 w-56 bg-card rounded-lg shadow-lg border border-border p-3 z-50 animate-in fade-in slide-in-from-top-2">
                            <p className="text-sm font-medium text-foreground mb-3 text-center">Xác nhận đăng xuất?</p>
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-muted transition-colors"
                              >
                                Hủy
                              </button>
                              <button 
                                onClick={() => {
                                  setShowLogoutConfirm(false);
                                  logout();
                                }}
                                className="flex-1 px-3 py-1.5 text-xs font-medium rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                              >
                                Đồng ý
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center h-9 text-sm font-medium bg-primary text-primary-foreground px-4 rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                    >
                      Đăng nhập
                    </Link>
                  )}
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
