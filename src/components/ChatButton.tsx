import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const GRADIENT = 'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)';

const SUGGESTIONS = [
  'What is his work experience?',
  'What are his top skills?',
  'Tell me about his projects',
  'Is he free on Saturday?',
];

const GREETING: ChatMessage = {
  role: 'assistant',
  content:
    "Hi! I'm Abhishek's AI assistant. Ask me anything about his experience, skills, projects, certifications, or even his weekly routine.",
};

export default function ChatButton() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: nextMessages.slice(1), // drop the local greeting
        }),
      });
      const data = await res.json();
      const reply: string =
        data.reply ||
        data.error ||
        "Sorry, something went wrong. Please try again.";
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content:
            "I couldn't reach the server. Make sure the chat API is running (npm run dev), then try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Trigger button — same gradient pill as the old Contact button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          background: GRADIENT,
          boxShadow: '0px 4px 4px rgba(181, 1, 167, 0.25), inset 4px 4px 12px #7721B1',
          outline: '2px solid white',
          outlineOffset: '-3px',
        }}
        className="rounded-full text-white font-medium uppercase tracking-widest px-8 py-3 sm:px-10 sm:py-3.5 md:px-12 md:py-4 text-xs sm:text-sm md:text-base hover:opacity-90 transition-opacity cursor-pointer"
      >
        Chat With Me
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end p-0 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Chat panel */}
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 flex flex-col w-full sm:w-[420px] h-[85vh] sm:h-[640px] sm:max-h-[85vh] rounded-t-[32px] sm:rounded-[32px] border-2 border-[#D7E2EA]/20 bg-[#0C0C0C] overflow-hidden"
              style={{ boxShadow: '0 0 60px rgba(182, 0, 168, 0.3)' }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-4 border-b border-[#D7E2EA]/10"
                style={{ background: GRADIENT }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-lg">
                    🤖
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold uppercase tracking-wide text-sm leading-tight">
                      Chat With Abhishek
                    </span>
                    <span className="text-white/70 text-[0.7rem] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                      AI assistant · online
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-white/80 hover:text-white text-2xl leading-none cursor-pointer"
                  aria-label="Close chat"
                >
                  ✕
                </button>
              </div>

              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-3"
              >
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                        m.role === 'user'
                          ? 'text-white rounded-br-md'
                          : 'bg-white/8 text-[#D7E2EA] rounded-bl-md border border-[#D7E2EA]/10'
                      }`}
                      style={m.role === 'user' ? { background: GRADIENT } : undefined}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white/8 border border-[#D7E2EA]/10 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
                      {[0, 1, 2].map((d) => (
                        <motion.span
                          key={d}
                          className="w-2 h-2 rounded-full bg-[#B600A8]"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestion chips (only before the first user message) */}
                {messages.length === 1 && !loading && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="rounded-full border border-[#D7E2EA]/25 text-[#D7E2EA]/80 hover:bg-white/10 hover:text-white transition-colors px-3 py-1.5 text-xs cursor-pointer"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-center gap-2 p-3 border-t border-[#D7E2EA]/10 bg-[#0C0C0C]"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about Abhishek…"
                  className="flex-1 bg-white/5 border border-[#D7E2EA]/15 rounded-full px-4 py-2.5 text-sm text-[#D7E2EA] placeholder:text-[#D7E2EA]/40 outline-none focus:border-[#B600A8]/60 transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  style={{ background: GRADIENT }}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white text-lg disabled:opacity-40 hover:opacity-90 transition-opacity cursor-pointer flex-shrink-0"
                  aria-label="Send message"
                >
                  ➤
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
