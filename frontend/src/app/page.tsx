"use client";
import { useState, useEffect, useCallback } from "react";
import SearchSidebar from "@/components/SearchSidebar";
import DocumentList from "@/components/DocumentList";
import Chatbot from "@/components/Chatbot";
import { searchService } from "@/services/searchService";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Document, SearchFilters } from "@/types";

export default function Home() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination & Sorting state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("relevance");
  const [paginationData, setPaginationData] = useState({ total_records: 0, total_pages: 1 });
  
  // Filter state
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({
    query: "",
    doc_types: [],
    statuses: [],
    issuing_bodies: [],
    issue_date_from: "",
    issue_date_to: "",
    effective_date_from: "",
    effective_date_to: ""
  });

  const fetchDocuments = useCallback(async (filters: SearchFilters, p: number, ps: number, sort: string) => {
    setLoading(true);
    try {
      const res = await searchService.searchDocuments(filters, p, ps, sort);
      setDocs(res.data);
      if (res.pagination) {
        setPaginationData(res.pagination);
      } else {
        setPaginationData({ total_records: res.data.length, total_pages: 1 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // When filters change from Sidebar, reset to page 1
  const handleSearch = (filters: SearchFilters) => {
    setCurrentFilters(filters);
    setPage(1);
    fetchDocuments(filters, 1, pageSize, sortBy);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchDocuments(currentFilters, newPage, pageSize, sortBy);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
    fetchDocuments(currentFilters, 1, newSize, sortBy);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setPage(1);
    fetchDocuments(currentFilters, 1, pageSize, newSort);
  };

  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Initial fetch
    if (user) {
      fetchDocuments(currentFilters, page, pageSize, sortBy);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (isLoading) {
    return <div className="flex h-full w-full items-center justify-center">Đang tải...</div>;
  }

  if (!user) {
    return (
      <div className="relative flex flex-col items-center justify-center h-full px-4 overflow-hidden bg-background">
        {/* Background Patterns */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="z-10 flex flex-col items-center text-center space-y-8 max-w-4xl">
          <div className="inline-flex items-center px-4 py-2 space-x-2 rounded-full bg-primary/10 text-primary">
            <span className="relative flex w-3 h-3">
              <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-primary"></span>
              <span className="relative inline-flex w-3 h-3 rounded-full bg-primary"></span>
            </span>
            <span className="text-sm font-medium">Phiên bản RAG AI mới nhất</span>
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl">
            Tra Cứu <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Pháp Luật Xây Dựng</span> Thông Minh
          </h1>
          
          <p className="max-w-2xl text-xl text-muted-foreground leading-relaxed">
            Hệ thống ứng dụng Trí tuệ nhân tạo (Generative AI) giúp bạn tìm kiếm, phân tích và giải đáp các thắc mắc về Luật, Nghị định, Thông tư ngành Xây Dựng một cách nhanh chóng và chính xác tuyệt đối.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link 
              href="/login" 
              className="px-8 py-4 text-lg font-semibold text-white transition-all rounded-xl shadow-lg bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95"
            >
              Đăng nhập để Tra Cứu
            </Link>
            <Link 
              href="/register" 
              className="px-8 py-4 text-lg font-semibold transition-all border-2 rounded-xl border-primary text-primary bg-transparent hover:bg-primary/5 hover:scale-105 active:scale-95"
            >
              Đăng ký tài khoản
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 w-full mt-12 border-t border-border">
            <div className="flex flex-col items-center space-y-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <h3 className="text-lg font-bold">Tìm kiếm Vector</h3>
              <p className="text-sm text-muted-foreground">Truy xuất ngữ nghĩa chính xác qua hàng ngàn điều khoản.</p>
            </div>
            <div className="flex flex-col items-center space-y-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              </div>
              <h3 className="text-lg font-bold">Chatbot Thông Minh</h3>
              <p className="text-sm text-muted-foreground">Hỏi đáp trực tiếp với trợ lý ảo am hiểu pháp luật.</p>
            </div>
            <div className="flex flex-col items-center space-y-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="text-lg font-bold">Thông tin Tin cậy</h3>
              <p className="text-sm text-muted-foreground">Dữ liệu được trích xuất từ cơ sở dữ liệu pháp luật chính thống.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full">
      {/* Cột 1: Sidebar Bộ Lọc (25%) */}
      <div className="w-1/4 min-w-[280px] max-w-[350px]">
        <SearchSidebar onSearch={handleSearch} />
      </div>

      {/* Cột 2: Danh sách kết quả (45%) */}
      <div className="flex-1 bg-background">
        <DocumentList 
          docs={docs} 
          loading={loading} 
          page={page}
          pageSize={pageSize}
          sortBy={sortBy}
          totalRecords={paginationData.total_records}
          totalPages={paginationData.total_pages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSortChange={handleSortChange}
        />
      </div>

      {/* Cột 3: Trợ lý AI (30%) */}
      <div id="tour-chatbot" className="w-[30%] min-w-[350px] max-w-[450px]">
        <Chatbot />
      </div>
    </div>
  );
}
