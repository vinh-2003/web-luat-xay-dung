"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccessMsg("Đăng ký thành công! Vui lòng đăng nhập.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const res = await authService.login(formData);
      login(res.access_token, res.user, rememberMe);
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Đăng nhập thất bại");
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await authService.googleLogin(credentialResponse.credential);
      login(res.access_token, res.user);
      router.push("/");
    } catch (err: any) {
      setError("Đăng nhập Google thất bại");
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-background pb-20 flex items-center justify-center">
      <div className="w-full max-w-md p-8 my-8 space-y-6 bg-card rounded-2xl shadow-lg border border-border">
        <h1 className="text-3xl font-bold text-center text-primary">Đăng nhập</h1>
        
        {error && <div className="p-3 text-sm text-red-500 bg-red-100 rounded-lg">{error}</div>}
        {successMsg && <div className="p-3 text-sm text-green-700 bg-green-100 rounded-lg">{successMsg}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">
                Ghi nhớ đăng nhập
              </label>
            </div>
            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
              Quên mật khẩu?
            </Link>
          </div>

          <button 
            type="submit" 
            className="w-full px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Đăng nhập
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-card text-muted-foreground">Hoặc tiếp tục với</span>
          </div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Đăng nhập Google thất bại")}
          />
        </div>

        <p className="text-sm text-center text-muted-foreground">
          Chưa có tài khoản? <Link href="/register" className="text-primary hover:underline">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[80vh] items-center justify-center">Đang tải...</div>}>
      <LoginForm />
    </Suspense>
  );
}
