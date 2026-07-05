"use client";

import { useState, useEffect, useCallback } from "react";
import { adminService } from "@/services/adminService";
import { Database, DownloadCloud, AlertTriangle, Clock, Play, Pause, Square, Activity, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { ConfirmModal } from "@/components/ConfirmModal";

export default function SystemManagement() {
  const [activeJob, setActiveJob] = useState<any>(null);
  const [history, setHistory] = useState<{ total: number; items: any[] }>({ total: 0, items: [] });
  const [schedule, setSchedule] = useState<any>({ source: "vbpl", mode: "schedule_scrape", cron_expression: "0 2 * * *", is_active: false });
  
  const [scraperForm, setScraperForm] = useState({ source: "vbpl", mode: "manual_scrape", timeout_minutes: 60 });
  
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

  // Polling for active job status
  const fetchStatus = useCallback(async () => {
    try {
      const status = await adminService.getScraperStatus();
      setActiveJob(status);
    } catch (error) {
      console.error("Lỗi lấy trạng thái scraper", error);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const data = await adminService.getScraperHistory(0, 10);
      setHistory(data);
    } catch (error) {
      console.error("Lỗi lấy lịch sử scraper", error);
    }
  }, []);

  const fetchSchedule = useCallback(async () => {
    try {
      const schedules = await adminService.getSchedules();
      if (schedules && schedules.length > 0) {
        setSchedule(schedules[0]);
      }
    } catch (error) {
      console.error("Lỗi lấy lịch tự động", error);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchHistory();
    fetchSchedule();
    
    // Poll active job every 3 seconds
    const interval = setInterval(() => {
      fetchStatus();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchStatus, fetchHistory, fetchSchedule]);

  const handleStartScraper = () => {
    setConfirmModal({
      isOpen: true,
      title: "Khởi chạy Crawler",
      message: "Bạn có chắc chắn muốn khởi chạy tiến trình cào dữ liệu ngay bây giờ không? Việc này có thể tốn thời gian và tài nguyên hệ thống.",
      type: "info",
      onConfirm: async () => {
        try {
          await adminService.triggerScraper(scraperForm);
          toast.success("Đã khởi chạy Crawler", {
            description: "Hệ thống đang tiến hành cào dữ liệu từ nguồn đã chọn.",
          });
          fetchStatus();
          fetchHistory();
        } catch (err: any) {
          toast.error("Lỗi khởi chạy", {
            description: err.response?.data?.detail || "Đã xảy ra lỗi không xác định.",
          });
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handlePause = async () => {
    if (!activeJob) return;
    try {
      await adminService.pauseScraper(activeJob.id);
      toast.success("Đã gửi lệnh Tạm dừng");
      fetchStatus();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Lỗi tạm dừng");
    }
  };

  const handleResume = async () => {
    if (!activeJob) return;
    try {
      await adminService.resumeScraper(activeJob.id);
      toast.success("Đã tiếp tục Crawler");
      fetchStatus();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Lỗi tiếp tục");
    }
  };

  const handleStop = () => {
    if (!activeJob) return;
    setConfirmModal({
      isOpen: true,
      title: "Dừng Crawler",
      message: "Bạn có chắc chắn muốn DỪNG HẲN tiến trình này không? Dữ liệu đang cào dở dang có thể sẽ không được lưu lại toàn bộ.",
      type: "danger",
      onConfirm: async () => {
        try {
          await adminService.stopScraper(activeJob.id);
          toast.success("Đã dừng Crawler", {
            description: "Tiến trình cào dữ liệu đã được dừng an toàn và giải phóng tài nguyên.",
          });
          fetchStatus();
          fetchHistory();
        } catch (err: any) {
          toast.error("Lỗi dừng Crawler", {
            description: err.response?.data?.detail || "Không thể dừng tiến trình lúc này.",
          });
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleSaveSchedule = async () => {
    try {
      await adminService.saveSchedule(schedule);
      toast.success("Đã lưu lịch tự động cập nhật");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Lỗi lưu lịch");
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "RUNNING": return "text-blue-500 bg-blue-500/10";
      case "PAUSED": return "text-amber-500 bg-amber-500/10";
      case "STOPPED": return "text-rose-500 bg-rose-500/10";
      case "COMPLETED": return "text-emerald-500 bg-emerald-500/10";
      case "FAILED": return "text-red-500 bg-red-500/10";
      default: return "text-slate-500 bg-slate-500/10";
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Cấu hình Hệ thống</h2>
      
      {/* 1. Trạng thái Crawler Thời gian thực */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Activity className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
              Trạng thái Crawler Hiện tại
              {activeJob?.status === "RUNNING" && (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
              )}
            </h3>
            
            {activeJob ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Trạng thái</p>
                  <p className={`mt-1 inline-flex px-2 py-1 rounded-md text-xs font-bold ${getStatusColor(activeJob.status)}`}>
                    {activeJob.status}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Nguồn</p>
                  <p className="mt-1 font-medium text-sm">{activeJob.source.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Trang đang cào</p>
                  <p className="mt-1 font-medium text-2xl text-primary">{activeJob.current_page}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Thêm / Sửa</p>
                  <p className="mt-1 font-medium text-2xl text-emerald-500">{activeJob.docs_added} <span className="text-muted-foreground text-sm">/ {activeJob.docs_updated}</span></p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Chưa có tiến trình nào được ghi nhận.</p>
            )}
            
            {activeJob?.message && (
              <div className="mt-4 p-3 bg-red-500/10 text-red-600 rounded-md text-sm border border-red-500/20">
                <AlertTriangle className="w-4 h-4 inline-block mr-2 -mt-0.5" />
                {activeJob.message}
              </div>
            )}
          </div>
          
          {/* Controls */}
          <div className="flex flex-col gap-2 min-w-[200px] shrink-0 justify-end">
            {(activeJob?.status === "RUNNING" || activeJob?.status === "PENDING") && (
              <button onClick={handlePause} className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 rounded-lg font-medium transition-colors border border-amber-500/20">
                <Pause className="w-4 h-4" /> Tạm dừng
              </button>
            )}
            {activeJob?.status === "PAUSED" && (
              <button onClick={handleResume} className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-lg font-medium transition-colors border border-emerald-500/20">
                <Play className="w-4 h-4" /> Tiếp tục
              </button>
            )}
            {(activeJob?.status === "RUNNING" || activeJob?.status === "PAUSED" || activeJob?.status === "PENDING") && (
              <button onClick={handleStop} className="flex items-center justify-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 rounded-lg font-medium transition-colors border border-rose-500/20">
                <Square className="w-4 h-4" /> Dừng hẳn
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. Form Cào dữ liệu Thủ công */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg shrink-0">
              <DownloadCloud className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg">Khởi chạy Crawler Thủ công</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nguồn dữ liệu</label>
              <select 
                value={scraperForm.source}
                onChange={e => setScraperForm({...scraperForm, source: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/50"
              >
                <option value="vbpl">Hệ thống Pháp luật (vbpl.vn)</option>
                <option value="all" disabled>Tất cả (Đang phát triển)</option>
                <option value="moc" disabled>Bộ Xây Dựng (moc.gov.vn) (Đang phát triển)</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Chức năng thực thi</label>
              <select 
                value={scraperForm.mode}
                onChange={e => setScraperForm({...scraperForm, mode: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/50"
              >
                <option value="manual_scrape">Cào tài liệu mới (Tìm kiếm & Phân tích AI)</option>
                <option value="manual_update">Cập nhật tài liệu cũ (Làm mới trạng thái)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Timeout (Phút)</label>
              <input 
                type="number" 
                value={scraperForm.timeout_minutes}
                onChange={e => setScraperForm({...scraperForm, timeout_minutes: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/50"
              />
              <p className="text-xs text-muted-foreground mt-1">Hệ thống sẽ tự dừng nếu tạm dừng quá số phút này.</p>
            </div>
            
            <button
              onClick={handleStartScraper}
              disabled={activeJob?.status === "RUNNING" || activeJob?.status === "PAUSED"}
              className="w-full mt-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" /> Bắt đầu cào dữ liệu
            </button>
          </div>
        </div>

        {/* 3. Lên lịch tự động */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg">Lên lịch Tự động (Cron)</h3>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={schedule.is_active}
                onChange={(e) => setSchedule({...schedule, is_active: e.target.checked})}
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="space-y-4 flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Giờ chạy (0-23)</label>
                <select 
                  value={schedule.cron_expression.split(" ")[1] || "2"}
                  onChange={e => {
                    const parts = schedule.cron_expression.split(" ");
                    if (parts.length >= 5) {
                      parts[1] = e.target.value;
                      setSchedule({...schedule, cron_expression: parts.join(" ")});
                    } else {
                      setSchedule({...schedule, cron_expression: `0 ${e.target.value} * * *`});
                    }
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/50"
                >
                  {Array.from({length: 24}).map((_, i) => (
                    <option key={i} value={i.toString()}>{i.toString().padStart(2, '0')}:00</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Phút (0-59)</label>
                <select 
                  value={schedule.cron_expression.split(" ")[0] || "0"}
                  onChange={e => {
                    const parts = schedule.cron_expression.split(" ");
                    if (parts.length >= 5) {
                      parts[0] = e.target.value;
                      setSchedule({...schedule, cron_expression: parts.join(" ")});
                    } else {
                      setSchedule({...schedule, cron_expression: `${e.target.value} 2 * * *`});
                    }
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/50"
                >
                  {Array.from({length: 60}).map((_, i) => (
                    <option key={i} value={i.toString()}>{i.toString().padStart(2, '0')}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground text-center bg-muted py-2 rounded-md border border-border/50">
              Hệ thống sẽ chạy tự động mỗi ngày vào lúc <strong>{schedule.cron_expression.split(" ")[1] || "2"}:{schedule.cron_expression.split(" ")[0] || "0"}</strong>
              <br/>
              <span className="opacity-50">(Cron nội bộ: <code>{schedule.cron_expression}</code>)</span>
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nguồn</label>
                <select 
                  value={schedule.source}
                  onChange={e => setSchedule({...schedule, source: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/50"
                >
                  <option value="vbpl">Hệ thống Pháp luật (vbpl.vn)</option>
                  <option value="all" disabled>Tất cả (Đang phát triển)</option>
                  <option value="moc" disabled>Bộ Xây Dựng (moc.gov.vn) (Đang phát triển)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Chức năng</label>
                <select 
                  value={schedule.mode}
                  onChange={e => setSchedule({...schedule, mode: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/50"
                >
                  <option value="schedule_scrape">Cào tài liệu mới (Hàng ngày)</option>
                  <option value="schedule_update">Cập nhật tài liệu cũ (Hàng ngày)</option>
                </select>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleSaveSchedule}
            className="w-full mt-6 px-4 py-2 border border-border text-foreground hover:bg-muted font-medium rounded-lg text-sm transition-colors"
          >
            Lưu cài đặt tự động
          </button>
        </div>
      </div>

      {/* 4. Lịch sử Crawler */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold text-lg">Lịch sử Crawler</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Job ID</th>
                <th className="px-4 py-3 font-medium">Bắt đầu</th>
                <th className="px-4 py-3 font-medium">Kết thúc</th>
                <th className="px-4 py-3 font-medium">Nguồn / Chế độ</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium">Số lượng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {history.items.map((job) => (
                <tr key={job.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{job.id}</td>
                  <td className="px-4 py-3">{format(new Date(job.started_at), "dd/MM/yyyy HH:mm")}</td>
                  <td className="px-4 py-3">{job.ended_at ? format(new Date(job.ended_at), "dd/MM/yyyy HH:mm") : "-"}</td>
                  <td className="px-4 py-3">
                    <span className="uppercase font-semibold text-xs text-muted-foreground mr-2">{job.source}</span>
                    <span className="text-xs text-muted-foreground">({job.mode})</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-bold ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-emerald-500 font-medium">+{job.docs_added}</span>
                    <span className="text-muted-foreground mx-1">/</span>
                    <span className="text-blue-500 font-medium">{job.docs_updated}</span>
                  </td>
                </tr>
              ))}
              {history.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Chưa có dữ liệu lịch sử</td>
                </tr>
              )}
            </tbody>
          </table>
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
    </div>
  );
}
