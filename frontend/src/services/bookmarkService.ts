import apiClient from '@/lib/api';

export const bookmarkService = {
  // Lấy danh sách toàn bộ văn bản đã lưu
  getBookmarks: async () => {
    try {
      const response = await apiClient.get('/bookmarks');
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đánh dấu:", error);
      return [];
    }
  },

  // Lấy danh sách ID văn bản đã lưu (để đồng bộ UI)
  getBookmarkedIds: async () => {
    try {
      const response = await apiClient.get('/bookmarks/ids');
      return response.data.data; // trả về mảng số [1, 5, 12, ...]
    } catch (error) {
      console.error("Lỗi khi lấy ID đánh dấu:", error);
      return [];
    }
  },

  // Thêm / Xóa đánh dấu (Toggle)
  toggleBookmark: async (documentId: number) => {
    const response = await apiClient.post(`/bookmarks/${documentId}`);
    return response.data; // { bookmarked: true/false, message: "..." }
  }
};
