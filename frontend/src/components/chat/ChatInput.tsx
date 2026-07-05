import { Send } from "lucide-react";
import { FormEvent } from "react";

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  loading: boolean;
  onSubmit: (e: FormEvent) => void;
}

export default function ChatInput({ input, setInput, loading, onSubmit }: ChatInputProps) {
  return (
    <div className="p-4 border-t border-border bg-background">
      <form className="flex gap-2" onSubmit={onSubmit}>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder="Đặt câu hỏi tình huống pháp lý..." 
          className="flex-1 bg-input border border-border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
        />
        <button 
          type="submit"
          disabled={loading}
          className="bg-primary text-primary-foreground p-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
