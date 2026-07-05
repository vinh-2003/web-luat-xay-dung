"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { bookmarkService } from "@/services/bookmarkService";
import { Document } from "@/types";
import { Bookmark, ExternalLink, BookmarkMinus, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function BookmarksPage() {
  const { user, isLoading: authLoading, bookmarkedIds, toggleBookmarkState } = useAuth();
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      window.location.href = "/login";
      return;
    }

    const fetchBookmarks = async () => {
      setLoading(true);
      const data = await bookmarkService.getBookmarks();
      setDocs(data);
      setLoading(false);
    };

    fetchBookmarks();
  }, [user, authLoading]);

  const handleRemoveBookmark = async (docId: number) => {
    try {
      await bookmarkService.toggleBookmark(docId);
      toggleBookmarkState(docId);
      // Xóa khỏi danh sách hiển thị
      setDocs(docs.filter(doc => doc.id !== docId));
    } catch (err) {
      alert("Lỗi khi bỏ lưu văn bản.");
    }
  };

  if (authLoading) return <div className="h-screen w-full flex items-center justify-center">Đang tải...</div>;
  if (!user) return null;

  return (
    <div className="h-full overflow-y-auto bg-background pb-20">
      <main className="flex-1 container max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Văn bản pháp luật đã lưu</h1>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-10">Đang tải danh sách...</div>
        ) : docs.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-border rounded-xl">
            <Bookmark className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-foreground mb-2">Chưa có văn bản nào</h3>
            <p className="text-muted-foreground">Bạn chưa lưu bất kỳ văn bản nào. Hãy quay lại trang chủ và tìm kiếm văn bản cần lưu nhé.</p>
            <Link href="/" className="inline-block mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
              Về trang chủ tìm kiếm
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {docs.map(doc => (
              <div key={doc.id} className="p-5 bg-card border border-border rounded-xl shadow-sm hover:border-primary/40 transition-colors group">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs font-medium bg-muted rounded">
                      {doc.type}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium border rounded ${
                      doc.status === "Còn hiệu lực" 
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleRemoveBookmark(doc.id)}
                    className="text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" 
                    title="Bỏ lưu văn bản"
                  >
                    <BookmarkMinus className="h-5 w-5" />
                  </button>
                </div>
                
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {doc.title}
                </h3>
                
                <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-muted-foreground mt-4">
                  <span>Số hiệu: <strong className="text-foreground">{doc.number}</strong></span>
                  <span>Ban hành: {doc.date}</span>
                  <span className="truncate max-w-[200px]" title={doc.issuing_body || ""}>CQ ban hành: {doc.issuing_body || "N/A"}</span>
                  
                  {doc.origin_url && (
                    <a href={doc.origin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline ml-auto">
                      <ExternalLink className="h-3 w-3" /> Xem chi tiết bản gốc
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
