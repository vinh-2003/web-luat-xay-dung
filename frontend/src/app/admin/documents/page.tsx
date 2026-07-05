"use client";

import { useEffect, useState, useCallback } from "react";
import { adminService } from "@/services/adminService";
import { format, parseISO } from "date-fns";
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Edit, Trash2, Filter } from "lucide-react";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ConfirmModal";

export default function DocumentsManagement() {
  const [data, setData] = useState<{ total: number; items: any[] }>({ total: 0, items: [] });
  const [filterOptions, setFilterOptions] = useState<{ types: string[], statuses: string[] }>({ types: [], statuses: [] });
  
  // States cho phân trang, tìm kiếm, lọc, sắp xếp
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("issue_date");
  const [order, setOrder] = useState("desc");
  
  // UI states
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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

  // Edit Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadFilterOptions = async () => {
    try {
      const options = await adminService.getDocumentFilters();
      setFilterOptions(options);
    } catch (err) {
      console.error("Lỗi tải bộ lọc", err);
    }
  };

  const fetchDocs = useCallback(() => {
    const skip = (page - 1) * limit;
    adminService.getDocuments(skip, limit, search, documentType, status, sortBy, order)
      .then(setData)
      .catch((err) => toast.error("Không thể tải danh sách văn bản"));
  }, [page, limit, search, documentType, status, sortBy, order]);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

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

  const handleDelete = (docId: number, docNumber: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Xóa văn bản",
      message: `Bạn có chắc chắn muốn xóa văn bản số ${docNumber}? Hệ thống sẽ xóa toàn bộ nội dung, siêu dữ liệu và các phân đoạn (chunks) trong Vector DB. Việc này không thể hoàn tác.`,
      type: "danger",
      onConfirm: async () => {
        const toastId = toast.loading("Đang xóa văn bản...");
        try {
          await adminService.deleteDocument(docId);
          toast.success("Đã xóa văn bản thành công", { id: toastId });
          fetchDocs();
        } catch (err: any) {
          toast.error(err.response?.data?.detail || "Lỗi xóa văn bản", { id: toastId });
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleOpenEdit = (doc: any) => {
    setEditDoc({ ...doc });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDoc) return;
    setIsSaving(true);
    const toastId = toast.loading("Đang lưu thay đổi...");
    try {
      await adminService.updateDocument(editDoc.id, {
        title: editDoc.title,
        document_number: editDoc.document_number,
        document_type: editDoc.document_type,
        status: editDoc.status,
        issue_date: editDoc.issue_date && editDoc.issue_date !== "N/A" ? editDoc.issue_date : null
      });
      toast.success("Lưu thay đổi thành công", { id: toastId });
      setIsEditModalOpen(false);
      fetchDocs();
      loadFilterOptions(); // reload filter options in case of new types/statuses
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Lỗi lưu văn bản", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (statusStr: string) => {
    if (!statusStr || statusStr === "N/A") {
      return <span className="inline-flex items-center px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-[10px] font-semibold uppercase tracking-wider">N/A</span>;
    }
    
    const lower = statusStr.toLowerCase();
    if (lower.includes("còn hiệu lực")) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-200 text-[10px] font-semibold uppercase tracking-wider">{statusStr}</span>;
    }
    if (lower.includes("hết hiệu lực một phần")) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-200 text-[10px] font-semibold uppercase tracking-wider">{statusStr}</span>;
    }
    if (lower.includes("hết hiệu lực")) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full bg-destructive/10 text-destructive border border-destructive/20 text-[10px] font-semibold uppercase tracking-wider">{statusStr}</span>;
    }
    
    return <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-200 text-[10px] font-semibold uppercase tracking-wider">{statusStr}</span>;
  };

  const totalPages = Math.ceil(data.total / limit) || 1;

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return <div className="w-4 h-4" />;
    return order === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Quản lý văn bản ({data.total})</h2>
        
        <div className="flex items-center gap-2">
          {/* Tìm kiếm */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Số hiệu, tiêu đề..." 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 pr-4 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-full"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors">
              Tìm
            </button>
          </form>

          {/* Toggle Filter */}
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`p-2 rounded-lg border transition-colors ${isFilterOpen ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted text-foreground"}`}
            title="Bộ lọc"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Khung Bộ Lọc */}
      {isFilterOpen && (
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 animate-in slide-in-from-top-2">
          <div className="w-full sm:w-1/3">
            <label className="block text-xs font-medium text-muted-foreground mb-1">Loại văn bản</label>
            <select 
              value={documentType}
              onChange={(e) => { setDocumentType(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Tất cả</option>
              {filterOptions.types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="w-full sm:w-1/3">
            <label className="block text-xs font-medium text-muted-foreground mb-1">Trạng thái</label>
            <select 
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Tất cả</option>
              {filterOptions.statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="w-full sm:w-auto self-end">
            <button 
              onClick={() => {
                setDocumentType("");
                setStatus("");
                setSearch("");
                setSearchInput("");
                setPage(1);
              }}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground underline transition-colors"
            >
              Xoá lọc
            </button>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium text-center w-16">STT</th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:bg-muted/80 w-48" onClick={() => handleSort("document_number")}>
                  <div className="flex items-center gap-1">Số hiệu <SortIcon column="document_number" /></div>
                </th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:bg-muted/80" onClick={() => handleSort("title")}>
                  <div className="flex items-center gap-1">Tiêu đề <SortIcon column="title" /></div>
                </th>
                <th className="px-6 py-4 font-medium">Loại VB</th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:bg-muted/80 w-32" onClick={() => handleSort("issue_date")}>
                  <div className="flex items-center gap-1">Ngày BH <SortIcon column="issue_date" /></div>
                </th>
                <th className="px-6 py-4 font-medium w-40">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.items.map((doc, index) => (
                <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-center font-medium text-muted-foreground">
                    {(page - 1) * limit + index + 1}
                  </td>
                  <td className="px-6 py-4 font-medium text-primary hover:underline">
                    <a href={doc.origin_url} target="_blank" rel="noreferrer" title="Mở trang gốc">{doc.document_number}</a>
                  </td>
                  <td className="px-6 py-4 max-w-md">
                    <a href={doc.origin_url} target="_blank" rel="noreferrer" className="font-medium text-foreground line-clamp-2 whitespace-normal hover:underline hover:text-primary" title="Mở trang gốc">
                      {doc.title}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {doc.document_type || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {doc.issue_date && doc.issue_date !== "N/A" ? format(parseISO(doc.issue_date), "dd/MM/yyyy") : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(doc.status)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        title="Chỉnh sửa"
                        onClick={() => handleOpenEdit(doc)}
                        className="p-1.5 rounded-md text-xs font-medium transition-colors border bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500 hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        title="Xóa văn bản"
                        onClick={() => handleDelete(doc.id, doc.document_number)}
                        className="p-1.5 rounded-md text-xs font-medium transition-colors border bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    Không tìm thấy văn bản nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/20">
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
            <span>/ {data.total} văn bản</span>
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

      {/* Edit Document Modal */}
      {isEditModalOpen && editDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-2xl rounded-xl shadow-lg border border-border overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border shrink-0">
              <h3 className="text-lg font-semibold tracking-tight">Chỉnh sửa Văn bản</h3>
              <p className="text-sm text-muted-foreground mt-1">Cập nhật thông tin cơ bản của văn bản {editDoc.document_number}</p>
            </div>
            <form onSubmit={handleSaveEdit} className="flex flex-col overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Số hiệu</label>
                    <input 
                      type="text" 
                      required
                      value={editDoc.document_number}
                      onChange={e => setEditDoc({...editDoc, document_number: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ngày ban hành (YYYY-MM-DD)</label>
                    <input 
                      type="text" 
                      value={editDoc.issue_date || ""}
                      onChange={e => setEditDoc({...editDoc, issue_date: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="2024-01-01"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Loại văn bản</label>
                    <input 
                      type="text" 
                      value={editDoc.document_type || ""}
                      onChange={e => setEditDoc({...editDoc, document_type: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Trạng thái</label>
                    <input 
                      type="text" 
                      value={editDoc.status || ""}
                      onChange={e => setEditDoc({...editDoc, status: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tiêu đề</label>
                  <textarea 
                    required
                    value={editDoc.title}
                    onChange={e => setEditDoc({...editDoc, title: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px] resize-y"
                  />
                </div>
              </div>
              <div className="bg-muted/50 px-6 py-4 flex items-center justify-end gap-3 border-t border-border shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-border bg-background hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? "Đang xử lý..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
