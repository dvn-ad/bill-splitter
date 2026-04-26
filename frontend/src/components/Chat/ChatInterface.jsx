import React, { useState } from 'react';
import { chatService } from '../../services/api';

const ChatInterface = ({ invoiceId, invoiceData }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatService.sendMessage(invoiceId, input, invoiceData);
      const aiMessage = { role: 'ai', text: response.data.reply };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-interface">
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role}`}>
            <strong>{m.role === 'user' ? 'You' : 'AI'}:</strong> {m.text}
          </div>
        ))}
        {loading && <div className="message ai">Thinking...</div>}
      </div>
      <div className="chat-input">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Ask about splitting..."
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} disabled={loading}>Send</button>
      </div>
    </div>
  );
};

export default ChatInterface;
