import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";

export type Message = {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
};

export interface ChatData {
  id: string;
  name: string;
  messages: Message[];
}

interface ChatDetailScreenProps {
  chat: ChatData;
  onBack: () => void;
  onSend: (text: string) => void;
}

export function ChatDetailScreen({ chat, onBack, onSend }: ChatDetailScreenProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pt-16 safe-area-top safe-area-bottom">
      <header className="px-4 py-3 flex items-center gap-3 border-b bg-card/95 backdrop-blur-md sticky top-16 z-10">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="font-semibold leading-tight font-poppins">{chat.name}</h2>
          <p className="text-xs text-muted-foreground font-poppins">online</p>
        </div>
      </header>

      <main className="flex-1 px-4 py-3 space-y-2 overflow-y-auto">
        {chat.messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === "me" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-card ${
                m.sender === "me"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted text-foreground rounded-bl-sm"
              }`}
            >
              <p className="font-poppins">{m.text}</p>
              <p className="mt-1 text-[10px] opacity-70 text-right font-poppins">{m.time}</p>
            </div>
          </div>
        ))}
      </main>

      <footer className="p-3 border-t bg-card/95 backdrop-blur-md sticky bottom-0">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Type a message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="h-12 rounded-xl font-poppins"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <Button onClick={handleSend} variant="gradient" className="h-12 px-5 rounded-xl font-poppins font-semibold">
            Send
          </Button>
        </div>
      </footer>
    </div>
  );
}
