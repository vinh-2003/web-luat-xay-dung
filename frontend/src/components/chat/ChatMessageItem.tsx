import { Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ChatMessage } from "@/types";

interface ChatMessageItemProps {
  msg: ChatMessage;
}

export default function ChatMessageItem({ msg }: ChatMessageItemProps) {
  return (
    <div className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "bot" ? "bg-primary/20" : "bg-blue-500/20"}`}>
        {msg.role === "bot" ? <Bot className="h-4 w-4 text-primary" /> : <span className="text-xs">You</span>}
      </div>
      <div className={`p-3 rounded-lg text-sm max-w-[85%] ${
        msg.role === "bot" 
          ? "bg-muted rounded-tl-none prose prose-sm prose-invert" 
          : "bg-primary/10 border border-primary/20 rounded-tr-none"
      }`}>
        {msg.role === "bot" ? (
          <ReactMarkdown
            components={{
              a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline" />
            }}
          >
            {msg.content}
          </ReactMarkdown>
        ) : (
          <p>{msg.content}</p>
        )}
      </div>
    </div>
  );
}
