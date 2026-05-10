import { useEffect, useRef } from "react";
import ChatBubble from "./ChatBubble.jsx";
import { useInvoice } from "../context/InvoiceContext.jsx";
import { MessageSquare } from "lucide-react";

export default function ChatWindow({ messages }) {
  const { invoice } = useInvoice();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-2 custom-scrollbar">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-50">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
            <MessageSquare className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Start a conversation by uploading a receipt.
          </p>
        </div>
      ) : (
        <>
          {messages.map((msg, i) => (
            <ChatBubble
              key={i}
              role={msg.role}
              content={msg.content}
              operation={msg.operation}
              result={msg.result}
              currency={invoice?.currency}
            />
          ))}
          <div ref={bottomRef} className="h-4" />
        </>
      )}
    </div>
  );
}
