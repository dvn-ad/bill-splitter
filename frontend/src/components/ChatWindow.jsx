import { useEffect, useRef } from "react";
import ChatBubble from "./ChatBubble.jsx";
import { useInvoice } from "../context/InvoiceContext.jsx";

export default function ChatWindow({ messages }) {
  const { invoice } = useInvoice();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
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
      <div ref={bottomRef} />
    </div>
  );
}
