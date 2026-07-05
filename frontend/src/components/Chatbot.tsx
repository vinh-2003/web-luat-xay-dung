"use client";

import { useState, useRef, useEffect } from "react";
import { chatService } from "@/services/chatService";
import { useAuth } from "@/context/AuthContext";
import { ChatMessage } from "@/types";
import { Bot } from "lucide-react";

import ChatHeader from "./chat/ChatHeader";
import ChatHistoryDropdown from "./chat/ChatHistoryDropdown";
import ChatMessageItem from "./chat/ChatMessageItem";
import ChatInput from "./chat/ChatInput";

export default function Chatbot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "bot",
      content: "Xin chào! Tôi là trợ lý ảo về Pháp luật Xây dựng. Bạn cần tôi giúp gì?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  // History State
  const [sessionId, setSessionId] = useState<number | undefined>(undefined);
  const [sessions, setSessions] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchSessions = async () => {
    if (!user) return;
    try {
      const data = await chatService.getSessions();
      setSessions(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user]);

  const handleNewChat = () => {
    setSessionId(undefined);
    setMessages([
      {
        id: Date.now().toString(),
        role: "bot",
        content: "Xin chào! Tôi là trợ lý ảo về Pháp luật Xây dựng. Bạn cần tôi giúp gì?",
        timestamp: new Date()
      }
    ]);
    setShowHistory(false);
  };

  const handleSelectSession = async (id: number) => {
    setShowHistory(false);
    setSessionId(id);
    setLoading(true);
    try {
      const msgs = await chatService.getSessionMessages(id);
      const formattedMsgs = msgs.map((m: any) => ({
        id: m.id.toString(),
        role: m.role,
        content: m.content,
        timestamp: new Date(m.created_at)
      }));
      setMessages([
        {
          id: "greeting-" + id,
          role: "bot",
          content: "Xin chào! Tôi là trợ lý ảo về Pháp luật Xây dựng. Bạn cần tôi giúp gì?",
          timestamp: msgs.length > 0 ? new Date(msgs[0].created_at) : new Date()
        },
        ...formattedMsgs
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    
    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setLoading(true);

    try {
      const historyToPass = messages.filter(m => m.role !== "bot" || m.content !== "Xin chào! Tôi là trợ lý ảo về Pháp luật Xây dựng. Bạn cần tôi giúp gì?");
      
      const res = await chatService.sendMessage(userMessage, historyToPass, sessionId);
      
      const newBotMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: res.answer,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newBotMsg]);
      
      if (!sessionId && res.session_id) {
        setSessionId(res.session_id);
        fetchSessions();
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(),
        role: "bot", 
        content: "Đã xảy ra lỗi khi kết nối tới máy chủ AI.",
        timestamp: new Date()
      }]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border-l border-border relative">
      <ChatHeader 
        isAuthenticated={!!user}
        showHistory={showHistory}
        onToggleHistory={() => setShowHistory(!showHistory)}
        onNewChat={handleNewChat}
      />

      {showHistory && (
        <ChatHistoryDropdown 
          sessions={sessions}
          sessionId={sessionId}
          onSelectSession={handleSelectSession}
        />
      )}

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
        {messages.map((msg, idx) => (
          <ChatMessageItem key={idx} msg={msg} />
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="bg-muted p-3 rounded-lg rounded-tl-none text-sm">
              <span className="animate-pulse">Đang phân tích...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput 
        input={input}
        setInput={setInput}
        loading={loading}
        onSubmit={handleSubmit}
      />
      
      {/* AI Warning Disclaimer */}
      <div className="bg-background px-4 pb-3 text-center">
        <p className="text-[10px] text-muted-foreground/70">
          Thông tin từ AI chỉ mang tính chất tham khảo, vui lòng đối chiếu với văn bản gốc.
        </p>
      </div>
    </div>
  );
}
