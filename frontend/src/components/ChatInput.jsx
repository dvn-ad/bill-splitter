import { useState, useRef, useEffect } from "react";
import UploadButton from "./UploadButton.jsx";
import { SendHorizonal } from "lucide-react";

export default function ChatInput({ onSend, onUpload, disabled }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

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

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  return (
    <div className="flex-none bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 md:p-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto flex items-end gap-3 bg-gray-50 dark:bg-gray-800 p-2 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all">
        <UploadButton onUpload={onUpload} />
        
        <textarea
          ref={textareaRef}
          rows={1}
          className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-sm md:text-base text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 py-2 px-1 max-h-40 overflow-y-auto resize-none"
          placeholder="Ask a question about your bill..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          disabled={disabled}
        />

        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="flex-none w-10 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-xl flex items-center justify-center transition-all active:scale-90"
          aria-label="Send Message"
        >
          <SendHorizonal className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
