import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  isDark: false,
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    const saved = localStorage.getItem("theme") as Theme;
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
    // Update meta theme-color for mobile browser chrome
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0c0910" : "#5E0B1D");
  }, [theme]);

  // Listen for system preference changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("theme")) {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Premium animated theme toggle
 * Sun ↔ Moon with morphing animation, orbital particles, and spring physics
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { toggleTheme, isDark } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className={`relative grid h-9 w-9 place-items-center rounded-xl transition-colors ${
        isDark
          ? "bg-white/10 border border-white/10 text-amber-300 hover:bg-white/15"
          : "bg-[#5E0B1D]/5 border border-[#5E0B1D]/10 text-[#5E0B1D] hover:bg-[#5E0B1D]/10"
      } ${className}`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`${isDark ? "Light" : "Dark"} mode`}
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Moon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
            {/* Orbital stars */}
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="absolute h-1 w-1 rounded-full bg-amber-300"
                animate={{
                  x: [0, Math.cos((i * 120 * Math.PI) / 180) * 14],
                  y: [0, Math.sin((i * 120 * Math.PI) / 180) * 14],
                  opacity: [0, 1, 0],
                  scale: [0, 1.2, 0],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Sun with animated rays */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/**
 * CSS Custom Properties for theming.
 * Injected into <head> — all colors reference these variables.
 */
export function ThemeStyles() {
  return (
    <style>{`
      :root, [data-theme="light"] {
        --bg: #FFFCFA;
        --bg-secondary: #F9F3F0;
        --bg-tertiary: #F7E9E2;
        --bg-card: #ffffff;
        --bg-card-hover: #ffffff;
        --bg-glass: rgba(255, 252, 250, 0.80);
        --bg-glass-dark: rgba(255, 255, 255, 0.65);

        --text: #1a0f12;
        --text-secondary: #2a1216;
        --text-muted: #3d2228;
        --text-faint: rgba(61, 34, 40, 0.75);

        --brand: #5E0B1D;
        --brand-light: #8B1538;
        --brand-bg: rgba(94, 11, 29, 0.05);
        --brand-border: rgba(94, 11, 29, 0.10);
        --brand-ring: rgba(94, 11, 29, 0.15);

        --border: rgba(94, 11, 29, 0.08);
        --border-strong: rgba(94, 11, 29, 0.15);
        --shadow: 0 10px 40px -10px rgba(94,11,29,0.14), 0 4px 12px -4px rgba(0,0,0,0.05);
        --shadow-lg: 0 25px 60px -15px rgba(94,11,29,0.22), 0 10px 20px -10px rgba(0,0,0,0.07);
        
        --dots: #5E0B1D0D;
        --selection-bg: rgba(94,11,29,0.15);
        --selection-text: #5E0B1D;

        --nav-link: rgba(42, 18, 22, 0.70);
        --star: #E6B25C;
        --success: #10b981;
      }

      [data-theme="dark"] {
        --bg: #0c0910;
        --bg-secondary: #13101a;
        --bg-tertiary: #1a1525;
        --bg-card: #16131e;
        --bg-card-hover: #1c1828;
        --bg-glass: rgba(12, 9, 16, 0.85);
        --bg-glass-dark: rgba(22, 19, 30, 0.80);

        --text: #f0ebe8;
        --text-secondary: #e0d8d2;
        --text-muted: #b5a8a0;
        --text-faint: rgba(181, 168, 160, 0.80);

        --brand: #c43a5a;
        --brand-light: #e85a7a;
        --brand-bg: rgba(196, 58, 90, 0.10);
        --brand-border: rgba(196, 58, 90, 0.18);
        --brand-ring: rgba(196, 58, 90, 0.25);

        --border: rgba(255, 255, 255, 0.06);
        --border-strong: rgba(255, 255, 255, 0.12);
        --shadow: 0 10px 40px -10px rgba(0,0,0,0.5), 0 4px 12px -4px rgba(0,0,0,0.3);
        --shadow-lg: 0 25px 60px -15px rgba(0,0,0,0.6), 0 10px 20px -10px rgba(0,0,0,0.4);

        --dots: rgba(196, 58, 90, 0.06);
        --selection-bg: rgba(196,58,90,0.25);
        --selection-text: #e85a7a;

        --nav-link: rgba(181, 168, 160, 0.80);
        --star: #E6B25C;
        --success: #34d399;
      }

      /* ── Transition all themed properties smoothly ── */
      [data-theme] {
        transition: background-color 0.5s ease, color 0.4s ease;
      }
      [data-theme] * {
        transition: background-color 0.4s ease, color 0.3s ease, border-color 0.4s ease, box-shadow 0.4s ease;
      }

      /* ── Themed utility overrides ── */
      .themed-bg { background-color: var(--bg) !important; }
      .themed-bg-secondary { background-color: var(--bg-secondary) !important; }
      .themed-bg-card { background-color: var(--bg-card) !important; }
      .themed-text { color: var(--text) !important; }
      .themed-text-muted { color: var(--text-muted) !important; }
      .themed-border { border-color: var(--border) !important; }

      /* Selection */
      [data-theme] ::selection {
        background: var(--selection-bg);
        color: var(--selection-text);
      }

      /* Glass morphism themed */
      [data-theme="dark"] .glass {
        backdrop-filter: blur(20px) saturate(120%);
        background: var(--bg-glass);
        border: 1px solid var(--border);
      }
      [data-theme="dark"] .glass-dark {
        backdrop-filter: blur(20px) saturate(120%);
        background: var(--bg-glass-dark);
        border: 1px solid var(--border-strong);
      }
      [data-theme="dark"] .premium-shadow {
        box-shadow: var(--shadow);
      }
      [data-theme="dark"] .premium-shadow-lg {
        box-shadow: var(--shadow-lg);
      }

      /* Dark mode glow enhancement */
      [data-theme="dark"] .animate-glow {
        opacity: 0.4;
      }

      /* Scrollbar */
      [data-theme="dark"] ::-webkit-scrollbar {
        width: 8px;
      }
      [data-theme="dark"] ::-webkit-scrollbar-track {
        background: #0c0910;
      }
      [data-theme="dark"] ::-webkit-scrollbar-thumb {
        background: #2a2235;
        border-radius: 4px;
      }
      [data-theme="dark"] ::-webkit-scrollbar-thumb:hover {
        background: #3a3045;
      }

      /* ══════════════════════════════════════════════
         COMPREHENSIVE DARK MODE OVERRIDES
         Targets all hardcoded Tailwind classes
         ══════════════════════════════════════════════ */

      /* Backgrounds */
      [data-theme="dark"] .bg-\\[\\#FFFCFA\\],
      [data-theme="dark"] .bg-\\[\\#F9F3F0\\] {
        background-color: var(--bg) !important;
      }
      [data-theme="dark"] .bg-white,
      [data-theme="dark"] .bg-white\\/70,
      [data-theme="dark"] .bg-white\\/60,
      [data-theme="dark"] .bg-white\\/80 {
        background-color: var(--bg-card) !important;
      }
      [data-theme="dark"] .bg-\\[\\#F7E9E2\\],
      [data-theme="dark"] .bg-\\[\\#F3DDD3\\] {
        background-color: rgba(196,58,90,0.06) !important;
      }

      /* Text colors */
      [data-theme="dark"] .text-\\[\\#1a0f12\\] { color: var(--text) !important; }
      [data-theme="dark"] .text-\\[\\#2a1216\\] { color: var(--text-secondary) !important; }
      [data-theme="dark"] .text-\\[\\#3d2228\\],
      [data-theme="dark"] .text-\\[\\#2a1216\\]\\/70,
      [data-theme="dark"] .text-\\[\\#3d2228\\]\\/80,
      [data-theme="dark"] .text-\\[\\#3d2228\\]\\/75,
      [data-theme="dark"] .text-\\[\\#3d2228\\]\\/70,
      [data-theme="dark"] .text-\\[\\#3d2228\\]\\/65 {
        color: var(--text-muted) !important;
      }

      /* Brand color adjustments */
      [data-theme="dark"] .text-\\[\\#5E0B1D\\] { color: var(--brand) !important; }
      [data-theme="dark"] .bg-\\[\\#5E0B1D\\] { background-color: var(--brand) !important; }
      [data-theme="dark"] .bg-\\[\\#5E0B1D\\]\\/5,
      [data-theme="dark"] .bg-\\[\\#5E0B1D\\]\\/8,
      [data-theme="dark"] .bg-\\[\\#5E0B1D\\]\\/10 {
        background-color: var(--brand-bg) !important;
      }
      [data-theme="dark"] .shadow-\\[\\#5E0B1D\\]\\/25,
      [data-theme="dark"] .shadow-\\[\\#5E0B1D\\]\\/20 {
        --tw-shadow-color: rgba(196,58,90,0.3) !important;
      }
      [data-theme="dark"] .ring-\\[\\#5E0B1D\\]\\/15 {
        --tw-ring-color: var(--brand-ring) !important;
      }

      /* Borders */
      [data-theme="dark"] .border-\\[\\#5E0B1D\\]\\/8,
      [data-theme="dark"] .border-\\[\\#5E0B1D\\]\\/10,
      [data-theme="dark"] .border-\\[\\#5E0B1D\\]\\/15 {
        border-color: var(--border-strong) !important;
      }

      /* Cards & surfaces */
      [data-theme="dark"] .rounded-\\[1\\.75rem\\].bg-white,
      [data-theme="dark"] .rounded-2xl.bg-white,
      [data-theme="dark"] .rounded-\\[1\\.65rem\\].bg-white,
      [data-theme="dark"] .rounded-\\[2rem\\].bg-white {
        background-color: var(--bg-card) !important;
      }

      /* Form inputs */
      [data-theme="dark"] input,
      [data-theme="dark"] textarea,
      [data-theme="dark"] select {
        background-color: var(--bg-secondary) !important;
        border-color: var(--border-strong) !important;
        color: var(--text) !important;
      }
      [data-theme="dark"] input::placeholder,
      [data-theme="dark"] textarea::placeholder {
        color: var(--text-muted) !important;
        opacity: 0.5;
      }
      [data-theme="dark"] input:focus,
      [data-theme="dark"] textarea:focus {
        background-color: var(--bg-card) !important;
        border-color: var(--brand) !important;
        --tw-ring-color: var(--brand-ring) !important;
      }
      [data-theme="dark"] label {
        color: var(--text-muted) !important;
      }

      /* Footer */
      [data-theme="dark"] footer {
        background-color: var(--bg) !important;
        border-color: var(--border) !important;
      }

      /* Testimonial section gradient bg */
      [data-theme="dark"] .from-\\[\\#F9F3F0\\] { --tw-gradient-from: var(--bg-secondary) !important; }
      [data-theme="dark"] .via-white { --tw-gradient-via: var(--bg) !important; }
      [data-theme="dark"] .to-\\[\\#F9F3F0\\] { --tw-gradient-to: var(--bg-secondary) !important; }
      [data-theme="dark"] .to-\\[\\#F9F3F0\\]\\/70 { --tw-gradient-to: transparent !important; }

      /* Gradient overlays */
      [data-theme="dark"] .from-\\[\\#F7E9E2\\] { --tw-gradient-from: rgba(196,58,90,0.08) !important; }
      [data-theme="dark"] .to-\\[\\#F3DDD3\\] { --tw-gradient-to: rgba(196,58,90,0.03) !important; }

      /* Process timeline line */
      [data-theme="dark"] .ring-\\[\\#FFFCFA\\] {
        --tw-ring-color: var(--bg) !important;
      }

      /* Mobile sticky CTA */
      [data-theme="dark"] .bg-white\\/85,
      [data-theme="dark"] .bg-white\\/90 {
        background-color: rgba(12,9,16,0.92) !important;
      }

      /* About section stat badge */
      [data-theme="dark"] .bg-\\[\\#FFFCFA\\] {
        background-color: var(--bg-secondary) !important;
      }
      [data-theme="dark"] .bg-\\[\\#5E0B1D\\]\\/15 {
        background-color: var(--brand-bg) !important;
      }

      /* Hero glow blobs - enhance in dark */
      [data-theme="dark"] .bg-\\[\\#5E0B1D\\]\\/10 {
        background-color: rgba(196,58,90,0.12) !important;
      }
      [data-theme="dark"] .bg-\\[\\#8B1538\\]\\/10 {
        background-color: rgba(232,90,122,0.08) !important;
      }

      /* Cursor glow - brighter in dark */
      [data-theme="dark"] .bg-\\[\\#5E0B1D\\]\\/8 {
        background-color: rgba(196,58,90,0.12) !important;
      }
    `}</style>
  );
}
