import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Gem, Search } from "lucide-react";

export type ChatPreview = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  avatar?: string;
  unread?: number;
};

interface ChatListScreenProps {
  chats: ChatPreview[];
  onOpenChat: (chatId: string) => void;
  onBack?: () => void;
  onBuyCoins?: () => void;
}

export function ChatListScreen({ chats, onOpenChat, onBack, onBuyCoins }: ChatListScreenProps) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => chats.filter(c => c.name.toLowerCase().includes(query.toLowerCase())),
    [chats, query]
  );

  return (
    <div className="min-h-screen bg-gray-50 safe-area-top">
      {/* Redesigned Header with integrated search */}
      <div className="relative bg-gradient-primary pt-16 pb-6 px-6 rounded-b-[32px] shadow-warm">
        <div className="flex items-center justify-between mb-6">
          {onBack && (
            <Button 
              onClick={onBack}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full w-12 h-12"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="flex-1 text-center">
            <h1 className="font-dancing text-3xl font-bold text-white mb-1">
              Messages
            </h1>
            <p className="text-white/90 font-poppins text-sm">Stay connected with friends</p>
          </div>
          {onBuyCoins && (
            <Button 
              onClick={onBuyCoins}
              variant="outline"
              size="sm"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 p-3 rounded-full min-h-12 min-w-12"
            >
              <Gem className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Integrated Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
          <Input
            placeholder="Search conversations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 pl-12 pr-4 rounded-2xl font-poppins bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white/50 backdrop-blur-sm"
          />
        </div>
      </div>

      <main className="pb-24 px-6 -mt-4 safe-area-bottom">
        <div className="max-w-lg mx-auto">
          {/* Chat List */}
          <div className="space-y-3">
            {filtered.map((chat) => (
              <Card
                key={chat.id}
                className="bg-white shadow-card cursor-pointer hover:shadow-warm transition-all duration-300 hover:scale-[1.02] rounded-2xl border-0 overflow-hidden"
                onClick={() => onOpenChat(chat.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    {/* Profile Picture with Online Indicator */}
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-full bg-gradient-primary text-white flex items-center justify-center text-lg font-bold font-poppins shadow-card ring-2 ring-white">
                        {chat.name.slice(0,1)}
                      </div>
                      {/* Online indicator */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                      
                      {/* Unread Badge positioned closer to avatar */}
                      {chat.unread && (
                        <div className="absolute -top-1 -right-1">
                          <Badge className="bg-red-500 hover:bg-red-500 text-white border-0 font-poppins text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5 shadow-card">
                            {chat.unread}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Chat Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-poppins font-bold text-lg text-gray-900 truncate">
                          {chat.name}
                        </h3>
                        <span className="text-xs text-gray-500 font-poppins font-medium ml-2 flex-shrink-0">
                          {chat.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate font-poppins font-normal leading-relaxed">
                        {chat.lastMessage}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Empty State */}
            {filtered.length === 0 && (
              <div className="text-center mt-16 px-8">
                <div className="w-24 h-24 bg-gradient-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-primary/60" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 font-poppins mb-2">
                  {query ? "No chats found" : "No conversations yet"}
                </h3>
                <p className="text-gray-500 font-poppins text-sm leading-relaxed">
                  {query 
                    ? "Try searching with a different name" 
                    : "Start a video call to begin your first conversation"
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}