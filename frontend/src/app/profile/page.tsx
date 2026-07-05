"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { UserIcon, Key, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function ProfilePage() {
  const { user, updateUser, isLoading } = useAuth();
  
  // Profile State
  const [name, setName] = useState("");
  const [profileMsg, setProfileMsg] = useState({ text: "", type: "" });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdMsg, setPwdMsg] = useState({ text: "", type: "" });
  const [isUpdatingPwd, setIsUpdatingPwd] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
    }
  }, [user]);

  if (isLoading) return <div className="h-screen w-full flex items-center justify-center">Đang tải...</div>;
  
  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }
  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự";
    if (!/[A-Z]/.test(pwd)) return "Mật khẩu phải chứa ít nhất 1 chữ hoa";
    if (!/[a-z]/.test(pwd)) return "Mật khẩu phải chứa ít nhất 1 chữ thường";
    if (!/[0-9]/.test(pwd)) return "Mật khẩu phải chứa ít nhất 1 số";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt";
    return "";
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg({ text: "", type: "" });
    setIsUpdatingProfile(true);
    
    try {
      const updatedUser = await authService.updateProfile(name);
      updateUser(updatedUser);
      setProfileMsg({ text: "Cập nhật thông tin thành công!", type: "success" });
    } catch (err: any) {
      setProfileMsg({ text: err.response?.data?.detail || "Lỗi khi cập nhật thông tin.", type: "error" });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg({ text: "", type: "" });
    
    if (newPassword !== confirmPassword) {
      setPwdMsg({ text: "Mật khẩu mới và Xác nhận mật khẩu không khớp.", type: "error" });
      return;
    }
    
    const pwdErr = validatePassword(newPassword);
    if (pwdErr) {
      setPwdMsg({ text: pwdErr, type: "error" });
      return;
    }

    setIsUpdatingPwd(true);
    
    try {
      const res = await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword
      });
      setPwdMsg({ text: res.msg || "Đổi mật khẩu thành công!", type: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPwdMsg({ text: err.response?.data?.detail || "Lỗi khi đổi mật khẩu.", type: "error" });
    } finally {
      setIsUpdatingPwd(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-background pb-20">
      <main className="container max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Thông tin tài khoản</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cột trái: Thông tin cơ bản */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                <UserIcon className="w-12 h-12" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{user.name || "Chưa cập nhật tên"}</h2>
              <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
              <div className="mt-4 px-3 py-1 bg-muted rounded-full text-xs font-medium inline-block">
                Vai trò: <span className="uppercase font-bold text-primary">{user.role}</span>
              </div>
            </div>
          </div>

          {/* Cột phải: Form cập nhật */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Form Thông tin */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                <UserIcon className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Thông tin cá nhân</h3>
              </div>
              
              {profileMsg.text && (
                <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${profileMsg.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {profileMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {profileMsg.text}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Địa chỉ Email (Định danh)</label>
                  <input 
                    type="email" 
                    disabled 
                    value={user.email}
                    className="w-full px-4 py-2 border rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Họ và tên hiển thị</label>
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary bg-background text-foreground"
                  />
                </div>
                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={isUpdatingProfile}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-70"
                  >
                    <Save className="w-4 h-4" />
                    {isUpdatingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            </div>

            {/* Form Đổi mật khẩu */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                <Key className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Đổi mật khẩu</h3>
              </div>

              {pwdMsg.text && (
                <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${pwdMsg.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {pwdMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {pwdMsg.text}
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Mật khẩu hiện tại</label>
                  <input 
                    type="password" 
                    required 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Mật khẩu mới</label>
                  <input 
                    type="password" 
                    required 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Xác nhận mật khẩu mới</label>
                  <input 
                    type="password" 
                    required 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary bg-background text-foreground"
                  />
                </div>
                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={isUpdatingPwd}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-70"
                  >
                    <Key className="w-4 h-4" />
                    {isUpdatingPwd ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
