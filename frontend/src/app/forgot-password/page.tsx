"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await axios.post("http://localhost:8000/api/v1/auth/forgot-password", {
        email
      });
      setMessage(res.data.msg);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-2xl shadow-lg border border-border">
        <h1 className="text-3xl font-bold text-center text-primary">Quên mật khẩu</h1>
        <p className="text-sm text-center text-muted-foreground">Nhập email của bạn để nhận liên kết khôi phục mật khẩu</p>
        
        {error && <div className="p-3 text-sm text-red-500 bg-red-100 rounded-lg">{error}</div>}
        {message && <div className="p-3 text-sm text-green-700 bg-green-100 rounded-lg">{message}</div>}
        
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

          <button 
            type="submit" 
            disabled={loading}
            className="w-full px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "Đang gửi..." : "Gửi liên kết"}
          </button>
        </form>

        <p className="text-sm text-center text-muted-foreground">
          Nhớ mật khẩu? <Link href="/login" className="text-primary hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
