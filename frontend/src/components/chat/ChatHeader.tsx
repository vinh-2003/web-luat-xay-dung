import { Bot, History, Plus } from "lucide-react";

interface ChatHeaderProps {
  isAuthenticated: boolean;
  showHistory: boolean;
  onToggleHistory: () => void;
  onNewChat: () => void;
}

export default function ChatHeader({ isAuthenticated, showHistory, onToggleHistory, onNewChat }: ChatHeaderProps) {
  return (
    <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
      <div className="flex items-center gap-2">
        <Bot className="h-5 w-5 text-primary" />
        <div>
          <h2 className="font-semibold text-sm">Trợ lý AI Pháp lý</h2>
          <p className="text-xs text-muted-foreground">Sử dụng Gemini 3 Pro (RAG)</p>
        </div>
      </div>
      
      {isAuthenticated && (
        <div className="flex items-center gap-1">
          <button 
            onClick={onToggleHistory}
            className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Lịch sử trò chuyện"
          >
            <History className="w-4 h-4" />
          </button>
          <button 
            onClick={onNewChat}
            className="p-2 rounded-md hover:bg-primary/10 text-primary transition-colors"
            title="Cuộc trò chuyện mới"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
