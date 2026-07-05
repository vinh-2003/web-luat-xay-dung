import { MessageSquare } from "lucide-react";

interface ChatSession {
  id: number;
  title: string;
}

interface ChatHistoryDropdownProps {
  sessions: ChatSession[];
  sessionId?: number;
  onSelectSession: (id: number) => void;
}

export default function ChatHistoryDropdown({ sessions, sessionId, onSelectSession }: ChatHistoryDropdownProps) {
  return (
    <div className="absolute top-16 right-4 w-72 bg-card border border-border rounded-lg shadow-xl z-50 flex flex-col max-h-[60vh] overflow-hidden">
      <div className="p-3 border-b border-border font-semibold text-sm">Lịch sử trò chuyện</div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sessions.length === 0 ? (
          <p className="text-xs text-center text-muted-foreground p-4">Chưa có cuộc trò chuyện nào.</p>
        ) : (
          sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectSession(s.id)}
              className={`w-full text-left p-2 rounded-md text-sm flex items-start gap-2 hover:bg-muted transition-colors ${sessionId === s.id ? 'bg-primary/10 text-primary' : 'text-foreground'}`}
            >
              <MessageSquare className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="truncate">{s.title}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
