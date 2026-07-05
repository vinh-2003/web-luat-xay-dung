"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/authService";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Đường dẫn khôi phục không hợp lệ hoặc đã hết hạn.");
    }
  }, [token]);

  // Kiểm tra mật khẩu mạnh
  const checkPasswordStrength = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial
    };
  };

  const strength = checkPasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    setError("");
    setMessage("");

    if (!strength.isValid) {
      setError("Mật khẩu chưa đủ mạnh. Vui lòng kiểm tra lại các yêu cầu bên dưới.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({ token, new_password: newPassword });
      setMessage("Đổi mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Mã khôi phục không hợp lệ hoặc đã hết hạn.");
    } finally {
      setLoading(false);
    }
  };

  const RequirementItem = ({ fulfilled, text }: { fulfilled: boolean, text: string }) => (
    <div className={`flex items-center gap-2 text-sm ${fulfilled ? 'text-emerald-500' : 'text-muted-foreground'}`}>
      {fulfilled ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4 opacity-50" />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-2xl shadow-lg border border-border">
      <h1 className="text-3xl font-bold text-center text-primary">Đặt lại mật khẩu</h1>
      
      {!token ? (
        <div className="text-center space-y-4">
          <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-lg">{error}</div>
          <Link href="/forgot-password" className="text-primary hover:underline inline-block mt-4">
            Quay lại trang quên mật khẩu
          </Link>
        </div>
      ) : message ? (
        <div className="text-center space-y-4">
          <div className="p-4 text-sm text-emerald-600 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            {message}
          </div>
          <p className="text-sm text-muted-foreground">Tự động chuyển hướng về trang đăng nhập...</p>
        </div>
      ) : (
        <>
          {error && <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-lg">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Mật khẩu mới</label>
              <input 
                type="password" 
                required 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background text-foreground"
                placeholder="Nhập mật khẩu mới..."
              />
            </div>

            {/* Bảng kiểm tra mật khẩu mạnh */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-2 border border-border/50">
              <p className="text-xs font-semibold mb-2">Yêu cầu mật khẩu:</p>
              <RequirementItem fulfilled={strength.minLength} text="Ít nhất 8 ký tự" />
              <RequirementItem fulfilled={strength.hasUpper} text="Chứa chữ cái in hoa (A-Z)" />
              <RequirementItem fulfilled={strength.hasLower} text="Chứa chữ cái thường (a-z)" />
              <RequirementItem fulfilled={strength.hasNumber} text="Chứa chữ số (0-9)" />
              <RequirementItem fulfilled={strength.hasSpecial} text="Chứa ký tự đặc biệt (!@#$%, v.v.)" />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Xác nhận mật khẩu</label>
              <input 
                type="password" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background text-foreground"
                placeholder="Nhập lại mật khẩu mới..."
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full px-4 py-2 text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition-colors font-medium"
            >
              {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-background p-4">
      <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Đang tải...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
