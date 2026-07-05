import apiClient from '@/lib/api';
import { ChatMessage } from '@/types';

export const chatService = {
  sendMessage: async (question: string, history: ChatMessage[], sessionId?: number) => {
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'bot',
      content: msg.content
    }));

    const response = await apiClient.post('/chat/', {
      question: question,
      history: formattedHistory,
      session_id: sessionId
    });
    
    return {
      answer: response.data.answer,
      session_id: response.data.session_id
    };
  },
  
  getSessions: async () => {
    const response = await apiClient.get('/chat/sessions');
    return response.data;
  },
  
  getSessionMessages: async (sessionId: number) => {
    const response = await apiClient.get(`/chat/sessions/${sessionId}`);
    return response.data;
  }
};
