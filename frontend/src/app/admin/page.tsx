"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/services/adminService";
import { Users, FileText, MessageSquare, Clock, ShieldCheck, FileCheck } from "lucide-react";
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";
import { format, parseISO } from "date-fns";
import Link from "next/link";

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#6366f1"];

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    adminService.getStats().then(setStats).catch(console.error);
  }, []);

  if (!stats) return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground">Đang tải dữ liệu...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-4 bg-blue-500/10 text-blue-500 rounded-xl">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Tổng người dùng</p>
            <h3 className="text-3xl font-bold text-foreground">{stats.total_users}</h3>
            <p className="text-xs text-muted-foreground mt-1">{stats.active_users} đang hoạt động</p>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Văn bản (Data)</p>
            <h3 className="text-3xl font-bold text-foreground">{stats.total_documents}</h3>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-4 bg-purple-500/10 text-purple-500 rounded-xl">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Phiên trò chuyện</p>
            <h3 className="text-3xl font-bold text-foreground">{stats.total_chat_sessions}</h3>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-4 bg-amber-500/10 text-amber-500 rounded-xl">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Hoạt động mới</p>
            <h3 className="text-3xl font-bold text-foreground">
              {(stats.recent_users?.length || 0) + (stats.recent_documents?.length || 0)}
            </h3>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            Phân loại Văn bản
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.document_stats_by_type}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {stats.document_stats_by_type?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => [`${value} văn bản`, "Số lượng"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            Trạng thái hiệu lực
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.document_stats_by_status}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" fontSize={12} tickMargin={10} />
                <YAxis allowDecimals={false} />
                <RechartsTooltip formatter={(value) => [`${value} văn bản`, "Số lượng"]} cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} name="Số lượng">
                  {stats.document_stats_by_status?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-primary" />
              Văn bản mới cập nhật
            </h3>
            <Link href="/admin/documents" className="text-xs font-medium text-primary hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="flex-1 p-0 overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium w-28">Số hiệu</th>
                  <th className="px-4 py-3 font-medium">Tiêu đề</th>
                  <th className="px-4 py-3 font-medium w-24">Ngày BH</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.recent_documents?.map((doc: any) => (
                  <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-primary text-xs">{doc.document_number}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground max-w-[200px] truncate" title={doc.title}>{doc.title}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{doc.status}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {doc.issue_date && doc.issue_date !== "N/A" ? format(parseISO(doc.issue_date), "dd/MM/yyyy") : "N/A"}
                    </td>
                  </tr>
                ))}
                {(!stats.recent_documents || stats.recent_documents.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">Không có dữ liệu</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Người dùng mới đăng ký
            </h3>
            <Link href="/admin/users" className="text-xs font-medium text-primary hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="flex-1 p-0 overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">Người dùng</th>
                  <th className="px-4 py-3 font-medium w-32">Ngày tham gia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.recent_users?.map((u: any) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {u.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{u.name}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {format(new Date(u.created_at), "dd/MM/yyyy HH:mm")}
                    </td>
                  </tr>
                ))}
                {(!stats.recent_users || stats.recent_users.length === 0) && (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">Không có dữ liệu</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
