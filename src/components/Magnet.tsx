import { useRef, useState, useCallback, ReactNode } from 'react';

interface MagnetProps {
  children: ReactNode;
  padding?: number;
  strength?: number;
  activeTransition?: string;
  inactiveTransition?: string;
  className?: string;
}

export default function Magnet({
  children,
  padding = 150,
  strength = 3,
  activeTransition = 'transform 0.3s ease-out',
  inactiveTransition = 'transform 0.6s ease-in-out',
  className = '',
}: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const threshold = Math.max(rect.width, rect.height) / 2 + padding;

    if (dist < threshold) {
      setActive(true);
      el.style.transition = activeTransition;
      el.style.transform = `translate3d(${dx / strength}px, ${dy / strength}px, 0)`;
    } else {
      setActive(false);
      el.style.transition = inactiveTransition;
      el.style.transform = 'translate3d(0, 0, 0)';
    }
  }, [padding, strength, activeTransition, inactiveTransition]);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setActive(false);
    el.style.transition = inactiveTransition;
    el.style.transform = 'translate3d(0, 0, 0)';
  }, [inactiveTransition]);

  const attachListeners = useCallback(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
  }, [handleMouseMove, handleMouseLeave]);

  const detachListeners = useCallback(() => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseleave', handleMouseLeave);
  }, [handleMouseMove, handleMouseLeave]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ willChange: 'transform', display: 'inline-block' }}
      onMouseEnter={attachListeners}
      onMouseLeave={() => { detachListeners(); handleMouseLeave(); }}
    >
      {children}
    </div>
  );
}
