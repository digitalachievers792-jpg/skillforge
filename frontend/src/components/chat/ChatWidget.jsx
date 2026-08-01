import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiSend, FiTrash2, FiX, FiZap } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import toast from 'react-hot-toast';
import { extractError } from '../../api/client';
import Avatar from '../ui/Avatar';

const quickPrompts = [
  'Which course should I take for web development?',
  'Help me build a career roadmap',
  'How do I prepare for interviews?',
];

const ChatWidget = () => {
  const { user } = useAuth();
  const { messages, sending, sendMessage, clearHistory } = useChat();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [unread, setUnread] = useState(false);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setUnread(false);
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [open, messages]);

  const handleSend = async (text) => {
    const value = text ?? input;
    if (!value.trim() || sending) return;
    setInput('');
    try {
      await sendMessage(value);
    } catch (err) {
      toast.error(extractError(err, 'Could not reach the AI mentor.'));
    }
  };

  if (!user) return null;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="fixed bottom-24 right-4 z-[90] flex h-[32rem] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl sm:right-6"
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-brand-600 via-violet-600 to-teal-500 px-4 py-3.5 text-white">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-lg">
                  🤖
                </span>
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-bold">
                    Forge <FiZap className="h-3.5 w-3.5 text-amber-300" />
                  </p>
                  <p className="text-[11px] text-white/80">AI Mentor · online</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    clearHistory();
                    toast.success('Conversation cleared');
                  }}
                  className="rounded-lg p-1.5 transition-colors hover:bg-white/20"
                  title="Clear conversation"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 transition-colors hover:bg-white/20"
                  title="Close"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
              {messages.length === 0 ? (
                <div className="space-y-3">
                  <div className="rounded-2xl rounded-tl-sm bg-white p-3.5 text-sm leading-relaxed text-slate-600 shadow-sm">
                    Hi {user.name.split(' ')[0]}! 👋 I'm <b>Forge</b>, your AI career &amp; learning mentor.
                    Ask me about courses, learning paths, interviews, or job hunting.
                  </div>
                  <div className="space-y-1.5">
                    {quickPrompts.map((p) => (
                      <button
                        key={p}
                        onClick={() => handleSend(p)}
                        className="block w-full rounded-xl border border-brand-100 bg-white px-3 py-2 text-left text-xs text-slate-600 shadow-sm transition-all hover:border-brand-300 hover:text-brand-700"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m._id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                    <div
                      className={
                        m.role === 'user'
                          ? 'max-w-[85%] rounded-2xl rounded-br-sm bg-gradient-to-r from-brand-600 to-violet-600 px-3.5 py-2.5 text-sm text-white shadow-sm'
                          : 'max-w-[85%] rounded-2xl rounded-tl-sm border border-slate-100 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-700 shadow-sm'
                      }
                    >
                      <div className="whitespace-pre-line">{m.content}</div>
                    </div>
                  </div>
                ))
              )}
              {sending && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-slate-100 bg-white px-4 py-3 shadow-sm">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400 [animation-delay:120ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400 [animation-delay:240ms]" />
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 bg-white p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Forge anything…"
                  className="input-base flex-1"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="btn-gradient rounded-xl p-2.5 disabled:opacity-50"
                  aria-label="Send"
                >
                  <FiSend className="h-4 w-4" />
                </button>
              </form>
              <button
                onClick={() => {
                  setOpen(false);
                  navigate('/courses');
                }}
                className="mt-2 text-[11px] font-medium text-brand-500 hover:text-brand-700"
              >
                Browse courses to ask about →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-5 right-4 z-[90] flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 via-violet-600 to-teal-500 text-white shadow-glow sm:right-6"
        aria-label="AI Mentor chat"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <FiX className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span key="b" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              🤖
            </motion.span>
          )}
        </AnimatePresence>
        {!open && !unread && messages.length === 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white"
          />
        )}
      </motion.button>
    </>
  );
};

export default ChatWidget;
