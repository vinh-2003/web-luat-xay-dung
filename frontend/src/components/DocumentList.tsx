"use client";

import { ExternalLink, BookmarkPlus, Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import { Document } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { bookmarkService } from "@/services/bookmarkService";

type DocumentListProps = {
  docs: Document[];
  loading: boolean;
  page: number;
  pageSize: number;
  sortBy: string;
  totalRecords: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSortChange: (sort: string) => void;
};

export default function DocumentList({ 
  docs, loading, page, pageSize, sortBy, totalRecords, totalPages,
  onPageChange, onPageSizeChange, onSortChange 
}: DocumentListProps) {
  const { user, bookmarkedIds, toggleBookmarkState } = useAuth();

  const handleBookmarkClick = async (docId: number) => {
    if (!user) {
      alert("Vui lòng đăng nhập để lưu văn bản!");
      return;
    }
    
    try {
      // Gọi service cập nhật API
      await bookmarkService.toggleBookmark(docId);
      // Cập nhật State ở Context
      toggleBookmarkState(docId);
    } catch (err) {
      console.error("Lỗi lưu văn bản", err);
      alert("Có lỗi xảy ra khi lưu văn bản.");
    }
  };

  return (
    <div id="tour-results" className="p-6 h-full flex flex-col overflow-hidden">
      {/* Header & Sorting */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Kết quả tra cứu</h1>
          <span className="text-sm text-muted-foreground">
            {loading ? "Đang tìm kiếm..." : `Tìm thấy ${totalRecords} văn bản`}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <label htmlFor="sort" className="text-muted-foreground">Sắp xếp:</label>
            <select 
              id="sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-input border border-border rounded-md px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="relevance">Độ liên quan (Tiêu đề &gt; Nội dung)</option>
              <option value="issue_date_desc">Ngày ban hành (Mới nhất)</option>
              <option value="issue_date_asc">Ngày ban hành (Cũ nhất)</option>
              <option value="effective_date_desc">Ngày có hiệu lực (Mới nhất)</option>
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2 pb-4">
        {loading && <div className="text-center text-muted-foreground">Đang tải dữ liệu...</div>}
        
        {!loading && docs.length === 0 && (
          <div className="text-center text-muted-foreground p-8 border border-dashed border-border rounded-lg">
            Không tìm thấy văn bản nào phù hợp.
          </div>
        )}

        {!loading && docs.map((doc) => (
          <div key={doc.id} className="p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs font-medium bg-muted rounded">
                  {doc.type}
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-muted/50 rounded">
                  {doc.issuing_body || "N/A"}
                </span>
                <span className={`px-2 py-1 text-xs font-medium border rounded ${
                  doc.status === "Còn hiệu lực" 
                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}>
                  {doc.status}
                </span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleBookmarkClick(doc.id)}
                  className={`transition-colors ${bookmarkedIds.includes(doc.id) ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-primary"}`} 
                  title={bookmarkedIds.includes(doc.id) ? "Bỏ lưu văn bản" : "Lưu văn bản"}
                >
                  {bookmarkedIds.includes(doc.id) ? (
                    <Bookmark className="h-5 w-5 fill-current" />
                  ) : (
                    <BookmarkPlus className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mb-1 text-foreground">
              {doc.title}
            </h3>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
              <span>Số hiệu: <strong className="text-foreground">{doc.number}</strong></span>
              <span>Ban hành: {doc.date}</span>
              {doc.origin_url && (
                <a href={doc.origin_url} target="_blank" rel="noopener noreferrer" className="tour-source flex items-center gap-1 text-primary hover:underline ml-auto">
                  <ExternalLink className="h-3 w-3" /> Nguồn gốc
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Footer */}
      {!loading && docs.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <select 
              value={pageSize} 
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-input border border-border rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-primary"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>kết quả / trang</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span>Trang {page} / {totalPages || 1}</span>
            <div className="flex gap-1">
              <button 
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="p-1 rounded bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="p-1 rounded bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
