import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!user) {
      setMessages([]);
      return;
    }
    try {
      const data = await api.get('/chat/history');
      setMessages(data.messages || []);
    } catch {
      /* ignore */
    }
  }, [user]);

  useEffect(() => {
    loadHistory();
  }, [user, loadHistory]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    const optimistic = { _id: `local-${Date.now()}`, role: 'user', content: trimmed };
    setMessages((prev) => [...prev, optimistic]);
    try {
      const data = await api.post('/chat/messages', { message: trimmed });
      setMessages((prev) => [...prev.filter((m) => m._id !== optimistic._id), ...data.messages]);
      return data;
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
      throw err;
    } finally {
      setSending(false);
    }
  };

  const clearHistory = async () => {
    try {
      await api.del('/chat/history');
      setMessages([]);
    } catch {
      /* ignore */
    }
  };

  const value = useMemo(
    () => ({ messages, sending, sendMessage, clearHistory, loadHistory }),
    [messages, sending, sendMessage, clearHistory, loadHistory]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
};
