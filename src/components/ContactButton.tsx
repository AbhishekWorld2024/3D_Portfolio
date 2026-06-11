import { useState } from 'react';

export default function ContactButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: 'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
          boxShadow: '0px 4px 4px rgba(181, 1, 167, 0.25), inset 4px 4px 12px #7721B1',
          outline: '2px solid white',
          outlineOffset: '-3px',
        }}
        className="rounded-full text-white font-medium uppercase tracking-widest px-8 py-3 sm:px-10 sm:py-3.5 md:px-12 md:py-4 text-xs sm:text-sm md:text-base hover:opacity-90 transition-opacity cursor-pointer"
      >
        Contact Me
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal card */}
          <div
            className="relative z-10 rounded-[40px] border-2 border-[#D7E2EA]/30 bg-[#0C0C0C] px-10 py-10 flex flex-col items-center gap-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
            style={{ boxShadow: '0 0 60px rgba(182, 0, 168, 0.25)' }}
          >
            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-5 right-6 text-[#D7E2EA] opacity-50 hover:opacity-100 transition-opacity text-2xl leading-none cursor-pointer"
            >
              ✕
            </button>

            {/* Title */}
            <h3
              className="hero-heading font-black uppercase tracking-tight leading-none text-center"
              style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)' }}
            >
              Get In Touch
            </h3>

            <div className="w-full flex flex-col gap-4">
              {/* Email */}
              <a
                href="mailto:abhishekarugonda3@gmail.com"
                className="flex items-center gap-4 rounded-2xl border border-[#D7E2EA]/20 bg-white/5 px-5 py-4 hover:bg-white/10 transition-colors group"
              >
                <span className="text-2xl">✉️</span>
                <div className="flex flex-col">
                  <span className="text-[#D7E2EA]/50 uppercase tracking-widest font-medium"
                    style={{ fontSize: '0.65rem' }}>Email</span>
                  <span className="text-[#D7E2EA] font-medium group-hover:text-white transition-colors"
                    style={{ fontSize: 'clamp(0.75rem, 2vw, 0.9rem)' }}>
                    abhishekarugonda3@gmail.com
                  </span>
                </div>
              </a>

              {/* Phone */}
              <a
                href="tel:+17855502806"
                className="flex items-center gap-4 rounded-2xl border border-[#D7E2EA]/20 bg-white/5 px-5 py-4 hover:bg-white/10 transition-colors group"
              >
                <span className="text-2xl">📱</span>
                <div className="flex flex-col">
                  <span className="text-[#D7E2EA]/50 uppercase tracking-widest font-medium"
                    style={{ fontSize: '0.65rem' }}>Phone</span>
                  <span className="text-[#D7E2EA] font-medium group-hover:text-white transition-colors"
                    style={{ fontSize: 'clamp(0.75rem, 2vw, 0.9rem)' }}>
                    +1 (785) 550-2806
                  </span>
                </div>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com/in/abhishek-arugonda"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-2xl border border-[#D7E2EA]/20 bg-white/5 px-5 py-4 hover:bg-white/10 transition-colors group"
              >
                <span className="text-2xl">💼</span>
                <div className="flex flex-col">
                  <span className="text-[#D7E2EA]/50 uppercase tracking-widest font-medium"
                    style={{ fontSize: '0.65rem' }}>LinkedIn</span>
                  <span className="text-[#D7E2EA] font-medium group-hover:text-white transition-colors"
                    style={{ fontSize: 'clamp(0.75rem, 2vw, 0.9rem)' }}>
                    linkedin.com/in/abhishek-arugonda
                  </span>
                </div>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/AbhishekWorld2024"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-2xl border border-[#D7E2EA]/20 bg-white/5 px-5 py-4 hover:bg-white/10 transition-colors group"
              >
                <span className="text-2xl">🐙</span>
                <div className="flex flex-col">
                  <span className="text-[#D7E2EA]/50 uppercase tracking-widest font-medium"
                    style={{ fontSize: '0.65rem' }}>GitHub</span>
                  <span className="text-[#D7E2EA] font-medium group-hover:text-white transition-colors"
                    style={{ fontSize: 'clamp(0.75rem, 2vw, 0.9rem)' }}>
                    github.com/AbhishekWorld2024
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
