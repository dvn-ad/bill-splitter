import { useState } from "react";
import UploadButton from "./UploadButton.jsx";

export default function ChatInput({ onSend, onUpload, disabled }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 px-4 py-3 flex items-end gap-2 bg-white">
      <UploadButton onUpload={onUpload} />
      <textarea
        rows={1}
        className="flex-1 resize-none border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32 overflow-y-auto"
        placeholder="Ask about the bill…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKey}
        disabled={disabled}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        className="bg-blue-600 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
      >
        Send
      </button>
    </div>
  );
}
