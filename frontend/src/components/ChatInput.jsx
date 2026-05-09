import { useState, useRef, useEffect } from "react";
import UploadButton from "./UploadButton.jsx";

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
      <div className="max-w-4xl mx-auto flex items-end gap-3 bg-gray-50 dark:bg-gray-800 p-2 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
        <UploadButton onUpload={onUpload} />
        
        <textarea
          ref={textareaRef}
          rows={1}
          className="flex-1 bg-transparent border-none focus:ring-0 text-sm md:text-base text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 py-2 px-1 max-h-40 overflow-y-auto resize-none"
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
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>
      <p className="text-[10px] text-center text-gray-400 dark:text-gray-600 mt-3 font-medium uppercase tracking-widest">
        Bill Splitter is powered by Gemini AI. Check important info for accuracy.
      </p>
    </div>
  );
}
