"use client";

import { useEffect, useState, useCallback } from "react";
import { adminService } from "@/services/adminService";
import { format } from "date-fns";
import { Shield, ShieldAlert, ShieldCheck, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Plus, Key } from "lucide-react";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ConfirmModal";

export default function UsersManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState(""); 
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState("desc");

  // Modal states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "danger" | "warning" | "info";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
    onConfirm: () => {}
  });

  // Create User Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "user" });
  const [isCreating, setIsCreating] = useState(false);

  const fetchUsers = useCallback(() => {
    const skip = (page - 1) * limit;
    adminService.getUsers(skip, limit, search, sortBy, order)
      .then(data => {
        setUsers(data.items);
        setTotal(data.total);
      })
      .catch((err) => {
        toast.error("Không thể tải danh sách người dùng");
      });
  }, [page, limit, search, sortBy, order]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); 
    setSearch(searchInput);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setOrder("asc");
    }
  };

  const handleToggleStatus = (userId: number, currentStatus: number) => {
    const isLocking = currentStatus === 1;
    setConfirmModal({
      isOpen: true,
      title: isLocking ? "Khóa tài khoản" : "Mở khóa tài khoản",
      message: isLocking 
        ? "Bạn có chắc chắn muốn khóa tài khoản này? Người dùng sẽ không thể đăng nhập." 
        : "Bạn có chắc chắn muốn mở khóa tài khoản này?",
      type: isLocking ? "danger" : "info",
      onConfirm: async () => {
        try {
          await adminService.toggleUserStatus(userId);
          toast.success("Đã cập nhật trạng thái người dùng");
          fetchUsers();
        } catch (err: any) {
          toast.error(err.response?.data?.detail || "Lỗi cập nhật trạng thái");
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleChangeRole = (userId: number, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const isUpgrading = newRole === "admin";
    
    setConfirmModal({
      isOpen: true,
      title: isUpgrading ? "Cấp quyền Quản trị" : "Hạ quyền Người dùng",
      message: isUpgrading 
        ? "Tài khoản này sẽ có toàn quyền quản trị hệ thống. Bạn có chắc chắn?" 
        : "Tài khoản này sẽ bị thu hồi quyền quản trị. Bạn có chắc chắn?",
      type: "warning",
      onConfirm: async () => {
        try {
          await adminService.changeUserRole(userId, newRole);
          toast.success("Đã cập nhật quyền thành công");
          fetchUsers();
        } catch (err: any) {
          toast.error(err.response?.data?.detail || "Lỗi cập nhật quyền");
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleResetPassword = (userId: number, userName: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Cấp lại Mật khẩu",
      message: `Bạn có chắc chắn muốn cấp lại mật khẩu cho ${userName}? Hệ thống sẽ tạo một mật khẩu ngẫu nhiên và gửi vào email của họ.`,
      type: "warning",
      onConfirm: async () => {
        const toastId = toast.loading("Đang tạo mật khẩu và gửi email...");
        try {
          await adminService.resetUserPassword(userId);
          toast.success("Đã cấp lại mật khẩu và gửi email thành công", { id: toastId });
        } catch (err: any) {
          toast.error(err.response?.data?.detail || "Lỗi cấp lại mật khẩu", { id: toastId });
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    
    setIsCreating(true);
    const toastId = toast.loading("Đang tạo tài khoản và gửi email...");
    try {
      await adminService.createUser(newUser);
      toast.success("Tạo tài khoản thành công! Mật khẩu đã được gửi qua email.", { id: toastId });
      setIsCreateModalOpen(false);
      setNewUser({ name: "", email: "", role: "user" });
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Lỗi khi tạo tài khoản", { id: toastId });
    } finally {
      setIsCreating(false);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return <div className="w-4 h-4" />;
    return order === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Quản lý người dùng</h2>
        
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Tìm kiếm tên, email..." 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 pr-4 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-full md:w-64"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors">
              Tìm
            </button>
          </form>
          
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tạo mới</span>
          </button>
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium text-center w-16">STT</th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:bg-muted/80" onClick={() => handleSort("name")}>
                  <div className="flex items-center gap-1">Người dùng <SortIcon column="name" /></div>
                </th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:bg-muted/80" onClick={() => handleSort("role")}>
                  <div className="flex items-center gap-1">Vai trò <SortIcon column="role" /></div>
                </th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:bg-muted/80" onClick={() => handleSort("created_at")}>
                  <div className="flex items-center gap-1">Ngày tham gia <SortIcon column="created_at" /></div>
                </th>
                <th className="px-6 py-4 font-medium text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u, index) => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-center font-medium text-muted-foreground">
                    {(page - 1) * limit + index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                        {u.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {u.role === "admin" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 text-xs font-semibold border border-purple-200">
                        <Shield className="w-3 h-3" /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold border border-border">
                        User
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {u.is_active === 1 ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div> Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-destructive text-xs font-semibold">
                        <div className="w-1.5 h-1.5 rounded-full bg-destructive"></div> Đã khóa
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {format(new Date(u.created_at), "dd/MM/yyyy HH:mm")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        title={u.role === "admin" ? "Hạ quyền User" : "Cấp quyền Admin"}
                        onClick={() => handleChangeRole(u.id, u.role)}
                        className={`p-1.5 rounded-md text-xs font-medium transition-colors border ${
                          u.role === "admin"
                            ? "bg-amber-500/10 text-amber-600 border-amber-200 hover:bg-amber-500 hover:text-white"
                            : "bg-purple-500/10 text-purple-600 border-purple-200 hover:bg-purple-500 hover:text-white"
                        }`}
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                      
                      <button
                        title="Cấp lại mật khẩu"
                        onClick={() => handleResetPassword(u.id, u.name)}
                        className="p-1.5 rounded-md text-xs font-medium transition-colors border bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500 hover:text-white"
                      >
                        <Key className="w-4 h-4" />
                      </button>

                      <button
                        title={u.is_active === 1 ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                        onClick={() => handleToggleStatus(u.id, u.is_active)}
                        className={`p-1.5 rounded-md text-xs font-medium transition-colors border ${
                          u.is_active === 1
                            ? "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive hover:text-destructive-foreground"
                            : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                        }`}
                      >
                        {u.is_active === 1 ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Section */}
        <div className="p-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Hiển thị</span>
            <select 
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="bg-background border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary/50"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>/ {total} người dùng</span>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-md text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium px-4">
              Trang {page} / {totalPages}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-md text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-xl shadow-lg border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold tracking-tight">Thêm người dùng mới</h3>
              <p className="text-sm text-muted-foreground mt-1">Hệ thống sẽ tự động tạo mật khẩu ngẫu nhiên và gửi tới email này.</p>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Họ và tên</label>
                  <input 
                    type="text" 
                    required
                    value={newUser.name}
                    onChange={e => setNewUser({...newUser, name: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Địa chỉ Email</label>
                  <input 
                    type="email" 
                    required
                    value={newUser.email}
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vai trò</label>
                  <select 
                    value={newUser.role}
                    onChange={e => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="user">Người dùng (User)</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
                </div>
              </div>
              <div className="bg-muted/50 px-6 py-4 flex items-center justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isCreating}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-border bg-background hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isCreating ? "Đang xử lý..." : "Tạo tài khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

