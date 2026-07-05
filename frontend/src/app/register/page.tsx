"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/authService";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const router = useRouter();

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự";
    if (!/[A-Z]/.test(pwd)) return "Mật khẩu phải chứa ít nhất 1 chữ hoa";
    if (!/[a-z]/.test(pwd)) return "Mật khẩu phải chứa ít nhất 1 chữ thường";
    if (!/[0-9]/.test(pwd)) return "Mật khẩu phải chứa ít nhất 1 số";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordError("Mật khẩu và Xác nhận mật khẩu không khớp");
      return;
    }
    
    const pwdErr = validatePassword(password);
    if (pwdErr) {
      setPasswordError(pwdErr);
      return;
    }
    setPasswordError("");

    try {
      await authService.register({
        name,
        email,
        password
      });
      // Redirect to login on success
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Đăng ký thất bại");
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-background pb-20 flex items-center justify-center">
      <div className="w-full max-w-md p-8 my-8 space-y-6 bg-card rounded-2xl shadow-lg border border-border">
        <h1 className="text-3xl font-bold text-center text-primary">Đăng ký tài khoản</h1>
        
        {error && <div className="p-3 text-sm text-red-500 bg-red-100 rounded-lg">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground">Họ và tên</label>
            <input 
              type="text" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-primary focus:border-primary bg-background text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground">Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-primary focus:border-primary bg-background text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground">Mật khẩu</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-primary focus:border-primary bg-background text-foreground"
            />
            {passwordError && <p className="text-sm text-red-500 mt-1">{passwordError}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground">Xác nhận mật khẩu</label>
            <input 
              type="password" 
              required 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-primary focus:border-primary bg-background text-foreground"
            />
          </div>

          <button 
            type="submit" 
            className="w-full px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Đăng ký
          </button>
        </form>

        <p className="text-sm text-center text-muted-foreground">
          Đã có tài khoản? <Link href="/login" className="text-primary hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
