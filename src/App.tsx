import { useEffect, useRef, useState } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  useMotionValue,
  AnimatePresence,
} from "framer-motion";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ClientLogin from "./pages/ClientLogin";
import ClientDashboard from "./pages/ClientDashboard";
import BlogPage from "./pages/BlogPage";
import OptimizedImage from "./components/OptimizedImage";
import { ThemeProvider, ThemeToggle, ThemeStyles, useTheme } from "./components/ThemeProvider";
import { useSiteData, submitContactForm } from "./lib/useFirebase";
import SEOHead, {
  OrganizationSchema,
  WebSiteSchema,
  ServicesSchema,
  ReviewsSchema,
  FAQSchema,
  BreadcrumbSchema,
  LocalBusinessSchema,
} from "./components/SEOHead";

/* ─────────────── Reusable animation variants ─────────────── */
const EASE = "easeOut" as const;
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: EASE, delay: i * 0.1 },
  }),
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: { duration: 0.6, ease: EASE, delay: i * 0.08 },
  }),
};
const scaleUp = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: (i = 0) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.6, ease: EASE, delay: i * 0.07 },
  }),
};

/* ─────────────── Section wrapper (scroll triggered) ─────────── */
function Section({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ─────────────── Magnetic Button ─────────────── */
function MagneticBtn({
  children,
  className = "",
  onClick,
  type = "button",
  strength = 0.4,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  strength?: number;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18 });
  const sy = useSpring(y, { stiffness: 200, damping: 18 });

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.button
      ref={ref}
      type={type}
      style={{ x: sx, y: sy }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      className={className}
      whileTap={{ scale: 0.96 }}
    >
      {children}
    </motion.button>
  );
}

/* ─────────────── Staggered word split ─────────────── */
function AnimatedHeading({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const words = text.split(" ");
  return (
    <span ref={ref} className={`inline-flex flex-wrap gap-x-[0.28em] ${className}`} aria-label={text}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 48, rotateX: -30 }}
          animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: delay + i * 0.07 }}
          style={{ display: "inline-block", transformOrigin: "bottom" }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

/* ─────────────── Cursor glow ─────────────── */
function CursorGlow() {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, { stiffness: 80, damping: 20 });
  const sy = useSpring(y, { stiffness: 80, damping: 20 });
  const { isDark } = useTheme();

  useEffect(() => {
    const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[9999] hidden lg:block"
      style={{ x: 0, y: 0 }}
    >
      <motion.div
        style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
        className="absolute h-64 w-64 rounded-full"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="h-full w-full rounded-full blur-3xl" style={{ backgroundColor: isDark ? "rgba(196,58,90,0.14)" : "rgba(94,11,29,0.06)" }} />
      </motion.div>
    </motion.div>
  );
}

/* ─────────────── Count Up ─────────────── */
function CountUp({ to }: { to: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const duration = 1800;
    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(to * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [to]);
  return <>{val}</>;
}

/* ═══════════════════════════════════════════════════════════ */
/*                      MAIN SITE                              */
/* ═══════════════════════════════════════════════════════════ */
function MainSite() {
  const [loading, setLoading] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [formData, setFormData] = useState({ name: "", business: "", email: "", phone: "", details: "" });
  const [formSent, setFormSent] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-100px" });
  const [previewUrl, setPreviewUrl] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  /* theme */
  const { isDark } = useTheme();

  /* Firebase data — falls back to localStorage automatically */
  const { siteContent, services, projects, testimonials, loading: dataLoading } = useSiteData();

  /* nav scroll state */
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 80],
    isDark ? ["rgba(12,9,16,0.5)", "rgba(12,9,16,0.95)"] : ["rgba(255,252,250,0.6)", "rgba(255,252,250,0.96)"]
  );
  const navShadow = useTransform(scrollY, [0, 80],
    isDark ? ["0 0 0 0 rgba(0,0,0,0)", "0 8px 32px -8px rgba(0,0,0,0.4)"] : ["0 0 0 0 rgba(94,11,29,0)", "0 8px 32px -8px rgba(94,11,29,0.12)"]
  );

  /* hero parallax */
  const heroRef = useRef(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(heroProgress, [0, 0.7], [1, 0]);

  /* Loader: hide after data arrives or 1.6s, whichever is first */
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1600);
    if (!dataLoading) setLoading(false);
    return () => clearTimeout(timer);
  }, [dataLoading]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenu(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
    /*
     * Triple-delivery: Email (Web3Forms) + Firebase lead + WhatsApp.
     * Each channel is independent so failure in one won't block the others.
     */
    await submitContactForm({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      business: formData.business,
      details: formData.details,
    });
    setTimeout(() => {
      setFormSent(false);
      setFormData({ name: "", business: "", email: "", phone: "", details: "" });
    }, 4000);
  };

  return (
    <div
      className="relative min-h-screen antialiased"
      style={{ fontFamily: "Inter, Poppins, system-ui, -apple-system, sans-serif", backgroundColor: "var(--bg)", color: "var(--text)" }}
      role="document"
      itemScope
      itemType="https://schema.org/WebPage"
    >
      <ThemeStyles />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[999] focus:bg-[#5E0B1D] focus:text-white focus:px-6 focus:py-3 focus:rounded-lg focus:top-4 focus:left-4">
        Skip to main content
      </a>
      <CursorGlow />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap');
        h1,h2,h3{font-family:"Poppins",Inter,sans-serif;letter-spacing:-0.02em}
        .display{font-family:"Fraunces","Poppins",serif}
        @keyframes glow{0%,100%{opacity:.6;filter:blur(40px)}50%{opacity:1;filter:blur(60px)}}
        @keyframes gradient{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        .animate-glow{animation:glow 4s ease-in-out infinite}
        .animate-gradient{background-size:200% 200%;animation:gradient 12s ease infinite}
        .glass{backdrop-filter:blur(20px) saturate(180%);background:var(--bg-glass);border:1px solid var(--border)}
        .glass-dark{backdrop-filter:blur(20px);background:var(--bg-glass-dark);border:1px solid var(--border-strong)}
        .premium-shadow{box-shadow:var(--shadow)}
        .premium-shadow-lg{box-shadow:var(--shadow-lg)}
        ::selection{background:var(--selection-bg);color:var(--selection-text)}
      `}</style>

      {/* ── SEO & STRUCTURED DATA ── */}
      <SEOHead
        title="Ambassador Cre8tive — Premium Websites That Grow Your Business"
        description={`${siteContent.hero.subheadline} Custom web design, e-commerce, landing pages, and website redesign by a premium agency in ${siteContent.contact.location || "Ibadan, Nigeria"}. Contact us: ${siteContent.contact.email}`}
      />
      <OrganizationSchema
        email={siteContent.contact.email}
        phone={siteContent.contact.phone}
        sameAs={[
          "https://www.instagram.com/ambassadorcre8tive",
          "https://www.twitter.com/ambassadorcre8",
          "https://www.linkedin.com/company/ambassadorcre8tive",
        ]}
      />
      <WebSiteSchema />
      <LocalBusinessSchema
        email={siteContent.contact.email}
        phone={siteContent.contact.phone}
      />
      <ServicesSchema
        services={services.map((s: any) => ({ title: s.title, desc: s.desc }))}
      />
      <ReviewsSchema
        reviews={testimonials.map((t: any) => ({ name: t.name, role: t.role, quote: t.quote }))}
      />
      <FAQSchema faqs={[
        { question: "How much does a website cost at Ambassador Cre8tive?", answer: "Our website projects start from competitive rates depending on your requirements. We offer custom quotes after a free consultation where we understand your business goals, scope, and timeline. Contact us at ambassadorcre8tive@gmail.com for a free quote." },
        { question: "How long does it take to build a website?", answer: "Most projects are delivered within 14 business days. Simple landing pages can be completed in as few as 5 days, while complex e-commerce stores may take 3-4 weeks. We prioritize fast delivery without compromising quality." },
        { question: "Do you offer website maintenance and support?", answer: "Yes! We provide ongoing maintenance, security updates, content updates, and technical support to keep your website running smoothly and performing at its best." },
        { question: "Can you redesign my existing website?", answer: "Absolutely. We specialize in transforming outdated websites into modern, premium digital experiences that convert visitors into customers. We'll audit your current site and propose a strategic redesign plan." },
        { question: "Do you build mobile-responsive websites?", answer: "Every website we build is mobile-first and fully responsive. Your site will look and function perfectly on smartphones, tablets, laptops, and desktops." },
        { question: "What technologies do you use?", answer: "We use modern technologies including React, Next.js, Tailwind CSS, WordPress, Shopify, and custom code. We choose the best tech stack for each project based on your specific needs and budget." },
      ]} />
      <BreadcrumbSchema items={[
        { name: "Home" },
        { name: "Services" },
        { name: "Portfolio" },
        { name: "Contact" },
      ]} />

      {/* ── LOADER ── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
            style={{ backgroundColor: "var(--bg)" }}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="absolute -inset-10 rounded-full bg-[#5E0B1D]/15 blur-3xl animate-glow" />
              <div className="relative h-20 w-20 rounded-3xl bg-gradient-to-br from-[#5E0B1D] to-[#8B1538] shadow-2xl shadow-[#5E0B1D]/30 grid place-items-center">
                <motion.span
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="text-[42px] font-bold text-[#F7F1ED]"
                  style={{ fontFamily: "Poppins" }}
                >A</motion.span>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-6 flex items-center gap-1.5"
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  className="h-1.5 w-1.5 rounded-full bg-[#5E0B1D]"
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NAV ── */}
      <header className="fixed top-0 z-40 w-full" role="banner">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <motion.div
            style={{ background: navBg, boxShadow: navShadow, borderColor: "var(--border)" }}
            className="mt-4 flex items-center justify-between rounded-2xl px-4 py-3 sm:px-6 backdrop-blur-xl border"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3"
            >
              <motion.div
                whileHover={{ rotate: [0, -4, 4, 0], scale: 1.08 }}
                transition={{ duration: 0.4 }}
                className="relative h-10 w-10 overflow-hidden rounded-xl bg-gradient-to-br from-[#5E0B1D] to-[#7A1128] shadow-lg shadow-[#5E0B1D]/20 grid place-items-center"
              >
                <img src={siteContent.logo} alt="Logo" className="h-full w-full object-cover" />
              </motion.div>
              <div>
                <div className="text-[15px] font-semibold tracking-tight leading-none" style={{ fontFamily: "Montserrat, Poppins" }}>
                  {siteContent.name.split(" ").length > 1 
                    ? <>{siteContent.name.split(" ")[0]} <span className="text-[#5E0B1D]">{siteContent.name.split(" ").slice(1).join(" ")}</span></>
                    : siteContent.name
                  }
                </div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-[#5E0B1D]/60 font-medium">{siteContent.tagline}</div>
              </div>
            </motion.div>

            <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
              {["Services", "Work", "Process", "About", "Blog"].map((item, i) => (
                <motion.button
                  key={item}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
                  onClick={() => item === "Blog" ? (window.location.hash = "#/blog") : scrollTo(item.toLowerCase())}
                  whileHover={{ color: "var(--brand)" }}
                  className="rounded-full px-4 py-2 text-[14px] font-medium transition hover:bg-[var(--brand-bg)]"
                  style={{ color: "var(--nav-link)" }}
                >
                  {item}
                </motion.button>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-2"
            >
              <ThemeToggle />
              <MagneticBtn
                onClick={() => scrollTo("contact")}
                className="hidden sm:inline-flex items-center gap-2 rounded-full bg-[#5E0B1D] px-5 py-2.5 text-[14px] font-semibold text-white shadow-lg shadow-[#5E0B1D]/25"
              >
                <span>Book Consultation</span>
                <motion.svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  animate={{ x: [0, 3, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </motion.svg>
              </MagneticBtn>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setMobileMenu(!mobileMenu)}
                className="grid h-10 w-10 place-items-center rounded-xl md:hidden"
                style={{ border: "1px solid var(--border-strong)", backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.6)" }}
              >
                <AnimatePresence mode="wait">
                  <motion.svg
                    key={mobileMenu ? "close" : "open"}
                    initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2"
                  >
                    {mobileMenu
                      ? <path d="M6 18L18 6M6 6l12 12" />
                      : <path d="M4 6h16M4 12h16M4 18h16" />}
                  </motion.svg>
                </AnimatePresence>
              </motion.button>
            </motion.div>
          </motion.div>

          <AnimatePresence>
            {mobileMenu && (
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.97 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto mt-2 max-w-[1200px] md:hidden"
              >
                <div className="overflow-hidden rounded-2xl glass premium-shadow">
                  <div className="grid gap-1 p-2">
                    {["Services", "Work", "Process", "About", "Contact"].map((item, i) => (
                      <motion.button
                        key={item}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => scrollTo(item.toLowerCase())}
                        className="rounded-xl px-4 py-3 text-left text-[15px] font-medium hover:bg-[#5E0B1D]/5 hover:text-[#5E0B1D]"
                      >
                        {item}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main id="main-content" role="main" itemScope itemType="https://schema.org/WebPageElement">

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative overflow-hidden pt-32 sm:pt-44 pb-16" aria-label="Hero">
        <div className="pointer-events-none absolute inset-0">
          <motion.div style={{ y: heroY }} className="absolute -top-40 left-1/2 h-[700px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#F7E9E2] via-[#F3DDD3] to-transparent opacity-70 blur-3xl" />
          <div className="absolute top-20 -left-20 h-72 w-72 rounded-full bg-[#5E0B1D]/10 blur-[80px] animate-glow" />
          <div className="absolute top-40 -right-20 h-72 w-72 rounded-full bg-[#8B1538]/10 blur-[80px] animate-glow" style={{ animationDelay: "1s" }} />
          <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(var(--dots) 1px, transparent 1px)`, backgroundSize: "28px 28px" }} />
        </div>

        <motion.div style={{ opacity: heroOpacity }} className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center gap-2 rounded-full border border-[#5E0B1D]/15 bg-white/70 px-3 py-1.5 backdrop-blur premium-shadow"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#5E0B1D] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#5E0B1D]" />
                </span>
                <span className="text-[12px] font-medium tracking-wide text-[#5E0B1D]">Available for new projects</span>
              </motion.div>

              <h1 className="mt-6 text-[42px] font-semibold leading-[1.05] tracking-[-0.02em] sm:text-[56px] lg:text-[64px]">
                <span className="display block overflow-hidden">
                  <AnimatedHeading text={siteContent.hero.headline.split(" ").slice(0, 2).join(" ")} delay={0.1} />
                </span>
                <span className="block overflow-hidden">
                  <AnimatedHeading text={siteContent.hero.headline.split(" ").slice(2, 4).join(" ")} className="opacity-70" delay={0.2} />
                </span>
                <span className="relative block overflow-hidden">
                  <AnimatedHeading
                    text={siteContent.hero.headline.split(" ").slice(4).join(" ")}
                    className="bg-gradient-to-r from-[#5E0B1D] via-[#8B1538] to-[#5E0B1D] bg-clip-text text-transparent animate-gradient"
                    delay={0.3}
                  />
                </span>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6 max-w-[520px] text-[17px] leading-relaxed text-[#3d2228]/80"
              >
                {siteContent.hero.subheadline}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.6 }}
                className="mt-8 flex flex-wrap items-center gap-3"
              >
                <MagneticBtn
                  onClick={() => scrollTo("contact")}
                  className="group relative overflow-hidden rounded-full bg-[#5E0B1D] px-7 py-3.5 text-[15px] font-semibold text-white shadow-xl shadow-[#5E0B1D]/25"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {siteContent.hero.ctaPrimary}
                    <motion.svg
                      animate={{ x: [0, 4, 0] }} transition={{ duration: 1.8, repeat: Infinity }}
                      width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    ><path d="M5 12h14M13 5l7 7-7 7" /></motion.svg>
                  </span>
                  <motion.div
                    initial={{ y: "100%" }}
                    whileHover={{ y: "0%" }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-gradient-to-r from-[#7A1128] to-[#5E0B1D]"
                  />
                </MagneticBtn>
                <MagneticBtn
                  onClick={() => scrollTo("services")}
                  className="rounded-full border border-[#5E0B1D]/15 bg-white/70 px-7 py-3.5 text-[15px] font-semibold text-[#5E0B1D] backdrop-blur"
                >
                  {siteContent.hero.ctaSecondary}
                </MagneticBtn>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}
                className="mt-10 flex items-center gap-6"
              >
                <div className="flex -space-x-2">
                  {["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100","https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100","https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100","https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"].map((src, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + i * 0.07 }}
                      className="h-9 w-9 rounded-full border-2 border-white overflow-hidden shadow-md"
                    >
                      <OptimizedImage
                        src={src}
                        alt={`Happy client ${i + 1}`}
                        className="h-full w-full"
                        priority
                        sizes="36px"
                        noBlur
                      />
                    </motion.div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <motion.svg key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 + i * 0.06 }}
                        width="16" height="16" viewBox="0 0 24 24" fill="#E6B25C" stroke="#E6B25C">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </motion.svg>
                    ))}
                  </div>
                  <p className="text-[13px] text-[#3d2228]/70"><span className="font-semibold text-[#1a0f12]">30+ businesses</span> trust us</p>
                </div>
              </motion.div>
            </div>

            {/* Right – mockup */}
            <div className="relative">
              <motion.div
                className="relative mx-auto w-full max-w-[560px]"
                initial={{ opacity: 0, x: 60, scale: 0.92 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="absolute -inset-10 -z-10 rounded-[3rem] bg-gradient-to-br from-[#5E0B1D]/20 via-[#8B1538]/15 to-transparent blur-3xl" />
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
                  <div className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-white/80 p-2.5 shadow-2xl backdrop-blur-xl premium-shadow-lg">
                    <div className="overflow-hidden rounded-[1.5rem] bg-[#0f0a0c]">
                      <div className="flex items-center gap-1.5 border-b border-white/10 bg-[#1a1013] px-4 py-2.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                        <div className="ml-3 flex-1"><div className="mx-auto h-6 w-64 rounded-full bg-white/5" /></div>
                      </div>
                      <OptimizedImage
                        src="/images/hero-mockup.png"
                        alt="Premium website mockup showcasing modern UI design"
                        className="aspect-[16/10] w-full"
                        priority
                        sizes="(min-width:1024px) 560px, 100vw"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Floating cards */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8, duration: 0.6 }}
                  className="absolute -left-6 top-16 hidden sm:block"
                >
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
                    <div className="glass-dark flex items-center gap-3 rounded-2xl px-4 py-3 premium-shadow">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#10b981]/15 text-[#059669]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-[#3d2228]/60">Conversion</div>
                        <div className="text-[15px] font-semibold">+247% up</div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0, duration: 0.6 }}
                  className="absolute -right-4 bottom-20 hidden sm:block"
                >
                  <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
                    <div className="glass-dark flex items-center gap-3 rounded-2xl px-4 py-3 premium-shadow">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#5E0B1D]/15 text-[#5E0B1D]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-[#3d2228]/60">Speed</div>
                        <div className="text-[15px] font-semibold">0.9s load</div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 1.1, duration: 0.8 }}
                className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
              >
                {["Google", "Shopify", "Webflow", "WordPress"].map((b, i) => (
                  <motion.div key={b} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 + i * 0.1 }}
                    className="text-[14px] font-semibold tracking-wide text-[#2a1216]/50">{b}</motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── ABOUT ── */}
      <Section id="about" className="relative mx-auto mt-24 max-w-[1200px] px-4 sm:px-6 lg:px-8 sm:mt-32">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div variants={scaleUp} custom={0} className="relative order-2 lg:order-1">
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-[#F7E9E2] to-[#F3DDD3] blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-[#5E0B1D]/10 bg-white p-1.5 premium-shadow-lg">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-3">
                  <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }} className="h-48 overflow-hidden rounded-2xl">
                    <OptimizedImage
                      src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg"
                      alt="Creative team collaborating on web design"
                      className="h-full w-full transition duration-500 hover:scale-105"
                      sizes="(min-width:640px) 280px, 50vw"
                    />
                  </motion.div>
                  <div className="grid h-36 place-items-center rounded-2xl bg-gradient-to-br from-[#5E0B1D] to-[#7A1128] text-white">
                    <div className="text-center">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, type: "spring" }}
                        className="text-[40px] font-bold leading-none"
                      >5+</motion.div>
                      <div className="text-[12px] uppercase tracking-widest opacity-80">Years Crafting</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="grid h-36 place-items-center rounded-2xl border border-[#5E0B1D]/10 bg-[#FFFCFA]">
                    <div className="text-center">
                      <div className="text-[12px] uppercase tracking-widest text-[#5E0B1D]/70">Premium</div>
                      <div className="mt-1 text-[18px] font-semibold">UI/UX Design</div>
                    </div>
                  </div>
                  <motion.div whileHover={{ scale: 1.02 }} className="h-48 overflow-hidden rounded-2xl">
                    <OptimizedImage
                      src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg"
                      alt="Designers reviewing modern website mockups"
                      className="h-full w-full transition duration-500 hover:scale-105"
                      sizes="(min-width:640px) 280px, 50vw"
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="order-1 lg:order-2">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 rounded-full bg-[#5E0B1D]/5 px-3 py-1 text-[12px] font-medium text-[#5E0B1D] ring-1 ring-inset ring-[#5E0B1D]/15">
              Why Choose Us
            </motion.div>
            <h2 className="mt-4 text-[32px] font-semibold leading-tight tracking-tight sm:text-[40px]">
              <AnimatedHeading text={siteContent.about.title} delay={0.05} />
            </h2>
            <motion.p variants={fadeUp} custom={2} className="mt-4 text-[17px] leading-relaxed text-[#3d2228]/80">
              {siteContent.about.content}
            </motion.p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { icon: "M13 10V3L4 14h7v7l9-11h-7z", title: "Lightning Fast", desc: "Optimized for speed and performance" },
                { icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z", title: "Mobile First", desc: "Perfect on every device" },
                { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", title: "Secure & Reliable", desc: "Enterprise-grade security" },
                { icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01", title: "Premium Design", desc: "Crafted for conversions" },
              ].map((f, i) => (
                <motion.div
                  key={f.title} variants={scaleUp} custom={i}
                  whileHover={{ y: -4, boxShadow: "0 16px 40px -10px rgba(94,11,29,0.18)" }}
                  className="group relative overflow-hidden rounded-2xl border border-[#5E0B1D]/8 bg-white p-5 cursor-default"
                >
                  <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[#5E0B1D]/5 blur-2xl transition group-hover:bg-[#5E0B1D]/15" />
                  <div className="relative flex items-start gap-3">
                    <motion.div whileHover={{ rotate: 10, scale: 1.1 }} className="grid h-10 w-10 place-items-center rounded-xl bg-[#5E0B1D]/8 text-[#5E0B1D]">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={f.icon} strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </motion.div>
                    <div>
                      <div className="font-semibold">{f.title}</div>
                      <div className="mt-1 text-[14px] text-[#3d2228]/70">{f.desc}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── SERVICES ── */}
      <Section id="services" className="relative mt-24 sm:mt-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-[#F9F3F0]/70 to-transparent" />
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[720px] text-center">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 rounded-full bg-[#5E0B1D]/5 px-3 py-1 text-[12px] font-medium text-[#5E0B1D] ring-1 ring-inset ring-[#5E0B1D]/15">Services</motion.div>
            <h2 className="mt-4 text-[32px] font-semibold leading-tight tracking-tight sm:text-[44px]">
              <AnimatedHeading text="Everything you need to win online" delay={0.05} />
            </h2>
            <motion.p variants={fadeUp} custom={2} className="mt-3 text-[17px] text-[#3d2228]/75">Premium websites designed to convert visitors into customers.</motion.p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s: any, i: number) => (
              <motion.div
                key={s.id} variants={scaleUp} custom={i}
                whileHover={{ y: -8, boxShadow: "0 24px 60px -15px rgba(94,11,29,0.22)" }}
                className="group relative overflow-hidden rounded-[1.75rem] border border-[#5E0B1D]/10 bg-white p-[1px] cursor-default"
              >
                <motion.div
                  initial={{ opacity: 0 }} whileHover={{ opacity: 1 }}
                  className="absolute inset-0 rounded-[1.75rem]"
                  style={{ background: "linear-gradient(180deg,rgba(94,11,29,0.18),transparent 40%)" }}
                />
                <div className="relative h-full rounded-[1.65rem] bg-white p-7">
                  <div className="flex items-center justify-between">
                    <motion.div whileHover={{ rotate: 8, scale: 1.12 }} className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#5E0B1D]/10 to-[#8B1538]/10 text-[#5E0B1D] ring-1 ring-inset ring-[#5E0B1D]/15">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d={s.icon} strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, scale: 0.7 }} whileHover={{ opacity: 1, scale: 1 }} className="grid h-8 w-8 place-items-center rounded-full bg-[#5E0B1D] text-white shadow-lg shadow-[#5E0B1D]/20">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M17 7H7m10 0v10" /></svg>
                    </motion.div>
                  </div>
                  <h3 className="mt-5 text-[19px] font-semibold tracking-tight">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#3d2228]/75">{s.desc}</p>
                  <motion.div
                    initial={{ scaleX: 0 }} whileHover={{ scaleX: 1 }}
                    className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-[#5E0B1D]/30 to-transparent origin-left"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── STATS ── */}
      <section className="mx-auto mt-24 max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={statsRef}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="relative overflow-hidden rounded-[2rem] border border-[#5E0B1D]/10 bg-gradient-to-br from-[#1a0f12] via-[#2a151b] to-[#1a0f12] p-[1px]"
        >
          <div className="relative rounded-[2rem] bg-[#0f0a0c]/90 px-6 py-12 sm:px-12 sm:py-16 backdrop-blur">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#5E0B1D]/30 blur-[100px]" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#8B1538]/20 blur-[100px]" />
            <div className="relative grid gap-10 lg:grid-cols-2 lg:gap-16">
              <div>
                <h3 className="text-[28px] font-semibold leading-tight text-white sm:text-[36px]">
                  <AnimatedHeading text="Built for performance, designed for growth" className="text-white" delay={0.05} />
                </h3>
                <motion.p variants={fadeIn} custom={2} className="mt-3 max-w-[480px] text-[16px] leading-relaxed text-white/70">
                  We combine strategy, design, and engineering to deliver websites that don't just look premium—they perform.
                </motion.p>
                <motion.div variants={fadeIn} custom={3} className="mt-8 flex flex-wrap gap-3">
                  {["Fast Delivery", "Mobile Optimized", "Premium UI/UX", "SEO Friendly", "Secure & Reliable", "Conversion Focused"].map((t, i) => (
                    <motion.span key={t} initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.07 }} viewport={{ once: true }}
                      whileHover={{ scale: 1.06, background: "rgba(255,255,255,0.12)" }}
                      className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[13px] font-medium text-white/85 backdrop-blur cursor-default"
                    >{t}</motion.span>
                  ))}
                </motion.div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: "Projects Delivered", value: 30, suffix: "+" },
                  { label: "Client Satisfaction", value: 95, suffix: "%" },
                  { label: "Avg. Delivery (days)", value: 14, suffix: "" },
                  { label: "Technologies", value: 12, suffix: "+" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.04 }}
                    className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur cursor-default"
                  >
                    <div className="text-[38px] font-bold leading-none text-white">
                      {statsInView ? <CountUp to={stat.value} /> : 0}{stat.suffix}
                    </div>
                    <div className="mt-2 text-[12px] uppercase tracking-wide text-white/60">{stat.label}</div>
                    <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-white/10 to-transparent blur-2xl" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── PORTFOLIO ── */}
      <Section id="work" className="mx-auto mt-24 max-w-[1200px] px-4 sm:mt-32 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 rounded-full bg-[#5E0B1D]/5 px-3 py-1 text-[12px] font-medium text-[#5E0B1D] ring-1 ring-inset ring-[#5E0B1D]/15">Portfolio</motion.div>
            <h2 className="mt-4 text-[32px] font-semibold leading-tight tracking-tight sm:text-[44px]">
              <AnimatedHeading text="Selected work" delay={0.05} />
            </h2>
          </div>
          <motion.p variants={fadeUp} custom={2} className="max-w-[420px] text-[15px] text-[#3d2228]/75">Premium websites crafted for brands across industries.</motion.p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p: any, i: number) => (
            <motion.div
              key={p.id} variants={scaleUp} custom={i}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-[1.75rem] border border-[#5E0B1D]/10 bg-white premium-shadow cursor-pointer"
            >
              <motion.div
                className="aspect-[4/3] overflow-hidden"
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <OptimizedImage
                  src={p.image}
                  alt={`${p.title} - ${p.tag} website project by Ambassador Cre8tive`}
                  className="h-full w-full"
                  sizes="(min-width:1024px) 380px, (min-width:640px) 50vw, 100vw"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }} whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-t from-[#0f0a0c]/85 via-[#0f0a0c]/30 to-transparent"
              />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <motion.div
                  initial={{ y: 12, opacity: 0 }}
                  whileHover={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-end justify-between gap-3"
                >
                  <div>
                    <div className="inline-flex rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-[#5E0B1D] backdrop-blur">{p.tag}</div>
                    <div className="mt-2 text-[18px] font-semibold text-white drop-shadow">{p.title}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); setPreviewUrl(p.url); setShowPreview(true); }}
                      className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[#5E0B1D] shadow-lg"
                      title="Preview Website"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </motion.button>
                    <motion.a
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      href={p.url} target="_blank" rel="noopener noreferrer"
                      className="grid h-9 w-9 place-items-center rounded-full bg-[#5E0B1D] text-white shadow-lg"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><path d="M15 3h6v6" /><path d="M10 14L21 3" /></svg>
                    </motion.a>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── TESTIMONIALS ── */}
      <Section className="relative mt-24 sm:mt-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#F9F3F0] via-white to-[#F9F3F0]" />
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 lg:px-8 sm:py-24">
          <div className="mx-auto max-w-[720px] text-center">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 rounded-full bg-[#5E0B1D]/5 px-3 py-1 text-[12px] font-medium text-[#5E0B1D] ring-1 ring-inset ring-[#5E0B1D]/15">Testimonials</motion.div>
            <h2 className="mt-4 text-[32px] font-semibold leading-tight tracking-tight sm:text-[44px]">
              <AnimatedHeading text="Loved by ambitious brands" delay={0.05} />
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {testimonials.map((t: any, i: number) => (
              <motion.div
                key={t.id} variants={fadeUp} custom={i}
                whileHover={{ y: -8, boxShadow: "0 24px 60px -15px rgba(94,11,29,0.18)" }}
                className="relative overflow-hidden rounded-[1.75rem] border border-[#5E0B1D]/10 bg-white p-[1px] premium-shadow cursor-default"
              >
                <div className="relative h-full rounded-[1.65rem] bg-white p-7">
                  <motion.div className="flex gap-1">
                    {[...Array(5)].map((_, si) => (
                      <motion.svg key={si} initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + si * 0.07 }} viewport={{ once: true }}
                        width="16" height="16" viewBox="0 0 24 24" fill="#E6B25C"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></motion.svg>
                    ))}
                  </motion.div>
                  <p className="mt-4 text-[15px] leading-relaxed text-[#2a1216]/85">"{t.quote}"</p>
                  <div className="mt-6 flex items-center gap-3">
                    <motion.div whileHover={{ scale: 1.1 }} className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                      <OptimizedImage
                        src={t.img}
                        alt={`Photo of ${t.name}, ${t.role}`}
                        className="h-full w-full"
                        sizes="40px"
                        noBlur
                      />
                    </motion.div>
                    <div>
                      <div className="text-[14px] font-semibold">{t.name}</div>
                      <div className="text-[12px] text-[#3d2228]/65">{t.role}</div>
                    </div>
                  </div>
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#5E0B1D]/5 blur-3xl" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── PROCESS ── */}
      <Section id="process" className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 rounded-full bg-[#5E0B1D]/5 px-3 py-1 text-[12px] font-medium text-[#5E0B1D] ring-1 ring-inset ring-[#5E0B1D]/15">Our Process</motion.div>
            <h2 className="mt-4 text-[32px] font-semibold leading-tight tracking-tight sm:text-[40px]">
              <AnimatedHeading text="From idea to launch in 4 steps" delay={0.05} />
            </h2>
            <motion.p variants={fadeUp} custom={2} className="mt-3 max-w-[480px] text-[16px] text-[#3d2228]/75">A proven process that delivers premium results, on time.</motion.p>
            <motion.div variants={fadeUp} custom={3} className="mt-8">
              <MagneticBtn onClick={() => scrollTo("contact")} className="inline-flex items-center gap-2 rounded-full bg-[#1a0f12] px-6 py-3 text-[14px] font-semibold text-white">
                Start your project
                <motion.svg animate={{ x: [0, 4, 0] }} transition={{ duration: 1.8, repeat: Infinity }}
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></motion.svg>
              </MagneticBtn>
            </motion.div>
          </div>

          <div className="relative">
            <div className="absolute left-[22px] top-4 bottom-4 w-px bg-gradient-to-b from-[#5E0B1D]/30 via-[#5E0B1D]/15 to-transparent hidden sm:block" />
            <div className="space-y-6">
              {[
                { step: "01", title: "Consultation", desc: "We learn your goals, audience, and vision to craft the perfect strategy." },
                { step: "02", title: "Planning & Design", desc: "Wireframes and premium UI designs tailored to your brand." },
                { step: "03", title: "Development", desc: "Clean, fast code with CMS integration and mobile optimization." },
                { step: "04", title: "Launch & Support", desc: "Deploy, train, and provide ongoing support to ensure growth." },
              ].map((p, i) => (
                <motion.div
                  key={p.step} variants={fadeUp} custom={i}
                  className="relative flex gap-5"
                >
                  <motion.div
                    whileHover={{ scale: 1.12, rotate: 3 }}
                    className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#5E0B1D] text-white shadow-lg shadow-[#5E0B1D]/25 ring-4 ring-[#FFFCFA]"
                  >
                    <span className="text-[13px] font-bold">{p.step}</span>
                  </motion.div>
                  <motion.div
                    whileHover={{ x: 4, boxShadow: "0 12px 32px -8px rgba(94,11,29,0.16)" }}
                    className="flex-1 rounded-2xl border border-[#5E0B1D]/10 bg-white p-5 premium-shadow"
                  >
                    <div className="text-[17px] font-semibold">{p.title}</div>
                    <div className="mt-1 text-[14px] leading-relaxed text-[#3d2228]/75">{p.desc}</div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── CONTACT ── */}
      <Section id="contact" className="relative mt-24 sm:mt-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent to-[#F9F3F0]" />
        <div className="mx-auto max-w-[1200px] px-4 pb-24 sm:px-6 lg:px-8">
          <motion.div
            variants={scaleUp} custom={0}
            className="grid overflow-hidden rounded-[2rem] border border-[#5E0B1D]/10 bg-white premium-shadow-lg lg:grid-cols-5"
          >
            <div className="relative bg-gradient-to-br from-[#1a0f12] via-[#2a151b] to-[#1a0f12] p-8 text-white sm:p-12 lg:col-span-2">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#5E0B1D]/30 blur-[80px]" />
              <div className="relative">
                <h3 className="text-[28px] font-semibold leading-tight sm:text-[32px]">Let's build something premium</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-white/75">Book a free consultation. We'll discuss your goals and show you exactly how we'll grow your business online.</p>
                <div className="mt-10 space-y-5">
                  {[
                    { icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6", label: "Email", value: siteContent.contact.email, href: `mailto:${siteContent.contact.email}` },
                    { icon: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z", label: "Phone / WhatsApp", value: siteContent.contact.phone, href: `https://wa.me/${siteContent.contact.phone.replace(/\D/g, "")}` },
                  ].map((item) => (
                    <motion.div key={item.label} whileHover={{ x: 4 }} className="flex items-start gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 backdrop-blur">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={item.icon} strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                      <div>
                        <div className="text-[12px] uppercase tracking-wide text-white/60">{item.label}</div>
                        <a href={item.href} target="_blank" className="text-[15px] font-medium hover:underline">{item.value}</a>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-10">
                  <div className="text-[13px] font-medium text-white/80">Trusted by businesses across Nigeria & beyond</div>
                  <div className="mt-3 flex flex-wrap items-center gap-4 opacity-80">
                    {["Ibadan", "Lagos", "Abuja", "UK", "US"].map((c, i) => (
                      <motion.span key={c} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="text-[12px]">{c}</motion.span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 sm:p-12 lg:col-span-3">
              <form onSubmit={handleSubmit} className="grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  {[
                    { label: "Full Name", key: "name", placeholder: "Your name", type: "text", required: true },
                    { label: "Business Name", key: "business", placeholder: "Company", type: "text", required: false },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="text-[13px] font-medium text-[#2a1216]">{f.label}</label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        required={f.required} type={f.type}
                        value={(formData as any)[f.key]}
                        onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                        className="mt-1.5 w-full rounded-xl border border-[#5E0B1D]/15 bg-[#FFFCFA] px-4 py-3 text-[15px] outline-none transition focus:border-[#5E0B1D]/40 focus:bg-white focus:ring-4 focus:ring-[#5E0B1D]/10"
                        placeholder={f.placeholder}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  {[
                    { label: "Email", key: "email", placeholder: "you@company.com", type: "email", required: true },
                    { label: "Phone Number", key: "phone", placeholder: "+234...", type: "text", required: false },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="text-[13px] font-medium text-[#2a1216]">{f.label}</label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        required={f.required} type={f.type}
                        value={(formData as any)[f.key]}
                        onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                        className="mt-1.5 w-full rounded-xl border border-[#5E0B1D]/15 bg-[#FFFCFA] px-4 py-3 text-[15px] outline-none transition focus:border-[#5E0B1D]/40 focus:bg-white focus:ring-4 focus:ring-[#5E0B1D]/10"
                        placeholder={f.placeholder}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-[13px] font-medium text-[#2a1216]">Project Details</label>
                  <motion.textarea
                    whileFocus={{ scale: 1.01 }}
                    required rows={4} value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    className="mt-1.5 w-full resize-none rounded-xl border border-[#5E0B1D]/15 bg-[#FFFCFA] px-4 py-3 text-[15px] outline-none transition focus:border-[#5E0B1D]/40 focus:bg-white focus:ring-4 focus:ring-[#5E0B1D]/10"
                    placeholder="Tell us about your project, goals, and timeline..."
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <MagneticBtn type="submit" className="group relative overflow-hidden rounded-full bg-[#5E0B1D] px-7 py-3.5 text-[15px] font-semibold text-white shadow-xl shadow-[#5E0B1D]/20">
                    <span className="relative z-10 flex items-center gap-2">
                      <AnimatePresence mode="wait">
                        {formSent ? (
                          <motion.span
                            key="sent"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="flex items-center gap-2"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            Message Sent!
                          </motion.span>
                        ) : (
                          <motion.span
                            key="send"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="flex items-center gap-2"
                          >
                            Send Message
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                    <motion.div initial={{ y: "100%" }} whileHover={{ y: "0%" }} transition={{ duration: 0.3 }}
                      className="absolute inset-0 bg-gradient-to-r from-[#7A1128] to-[#5E0B1D]" />
                  </MagneticBtn>
                  <div className="text-[13px] text-[#3d2228]/70">
                    📧 Delivered to email · 💾 Saved to CRM · 💬 Opens WhatsApp · Reply within 2 hours
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </Section>

      </main>{/* end main */}

      {/* ── FOOTER ── */}
      <footer className="border-t" role="contentinfo" itemScope itemType="https://schema.org/WPFooter" style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}>
        <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
              <div className="flex items-center gap-3">
                <motion.div whileHover={{ rotate: [0, -4, 4, 0] }} className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#5E0B1D] to-[#7A1128] shadow-md">
                  <span className="text-[22px] font-bold text-white">A</span>
                </motion.div>
                <div>
                  <div className="font-semibold">Ambassador Cre8tive</div>
                  <div className="text-[12px] text-[#3d2228]/65">Premium Web Agency</div>
                </div>
              </div>
              <p className="mt-4 max-w-[280px] text-[14px] leading-relaxed text-[#3d2228]/75">We craft premium, conversion-focused websites for ambitious businesses ready to dominate online.</p>
            </motion.div>

            {[
              { title: "Quick Links", items: [
                ...["Services", "Work", "Process", "About", "Contact"].map((l) => ({ label: l, onClick: () => scrollTo(l.toLowerCase()) })),
                { label: "Blog", onClick: () => { window.location.hash = "#/blog"; } },
              ] },
            ].map((col) => (
              <motion.div key={col.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} viewport={{ once: true }}>
                <div className="text-[13px] font-semibold uppercase tracking-wide text-[#2a1216]/70">{col.title}</div>
                <div className="mt-3 grid gap-2 text-[14px]">
                  {col.items.map((item) => (
                    <motion.button key={item.label} onClick={item.onClick} whileHover={{ x: 4, color: "#5E0B1D" }} className="text-left text-[#3d2228]/80 transition">{item.label}</motion.button>
                  ))}
                </div>
              </motion.div>
            ))}

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} viewport={{ once: true }}>
              <div className="text-[13px] font-semibold uppercase tracking-wide text-[#2a1216]/70">Contact</div>
              <div className="mt-3 grid gap-2 text-[14px] text-[#3d2228]/80">
                <motion.a whileHover={{ x: 3, color: "#5E0B1D" }} href={`mailto:${siteContent.contact.email}`} className="transition">{siteContent.contact.email}</motion.a>
                <motion.a whileHover={{ x: 3, color: "#5E0B1D" }} href={`https://wa.me/${siteContent.contact.phone.replace(/\D/g,"")}`} target="_blank" className="transition">{siteContent.contact.phone}</motion.a>
                <div>{siteContent.contact.location || "Ibadan, Nigeria"}</div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} viewport={{ once: true }}>
              <div className="text-[13px] font-semibold uppercase tracking-wide text-[#2a1216]/70">Follow</div>
              <div className="mt-3 flex items-center gap-3">
                {[
                  { name: "Instagram", icon: "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z M17.5 6.5h.01 M7.5 2h9a5.5 5.5 0 015.5 5.5v9a5.5 5.5 0 01-5.5 5.5h-9A5.5 5.5 0 012 16.5v-9A5.5 5.5 0 017.5 2z", url: siteContent.social?.instagram },
                  { name: "Twitter/X", icon: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z", url: siteContent.social?.twitter },
                  { name: "LinkedIn", icon: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z M2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z", url: siteContent.social?.linkedin },
                  { name: "Facebook", icon: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z", url: siteContent.social?.facebook },
                  { name: "TikTok", icon: "M9 12a4 4 0 104 4V4a5 5 0 005 5", url: siteContent.social?.tiktok },
                ].filter(s => s.url).map((s, i) => (
                  <motion.a key={s.name} href={s.url || "#"} target="_blank" rel="noopener noreferrer" aria-label={s.name}
                    initial={{ opacity: 0, scale: 0.7 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.1 }} viewport={{ once: true }}
                    whileHover={{ y: -3, backgroundColor: "#5E0B1D", color: "white" }}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-[#5E0B1D]/10 bg-white text-[#5E0B1D] transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={s.icon} strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#5E0B1D]/8 pt-6 text-[13px] text-[#3d2228]/65">
            <div className="flex items-center gap-3">
              <span>© {new Date().getFullYear()} Ambassador Cre8tive. All rights reserved.</span>
              <motion.button
                onClick={() => { window.location.hash = "#/admin"; }}
                whileHover={{ opacity: 0.6 }}
                className="opacity-15 transition-opacity"
                title="Admin" aria-label="Admin Dashboard"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </motion.button>
            </div>
            <div className="flex gap-4">
              <motion.a whileHover={{ color: "#5E0B1D" }} href="#" className="transition">Privacy</motion.a>
              <motion.a whileHover={{ color: "#5E0B1D" }} href="#" className="transition">Terms</motion.a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── FLOATING WHATSAPP ── */}
      <motion.a
        href="https://wa.me/2349030192034?text=Hello%20Ambassador%20Cre8tive!%20I'm%20interested%20in%20a%20premium%20website."
        target="_blank"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.92 }}
        className="group fixed bottom-5 right-5 z-40 hidden sm:grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-2xl shadow-[#25D366]/30 sm:bottom-6 sm:right-6"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M20.52 3.48A11.86 11.86 0 0012.02 0 11.93 11.93 0 001.5 17.94L0 24l6.2-1.62a11.93 11.93 0 005.82 1.48h.01A11.93 11.93 0 0020.52 3.48zM12.03 21.5a9.48 9.48 0 01-4.83-1.32l-.35-.2-3.68.96.98-3.59-.23-.37a9.5 9.5 0 1116.6-3.02 9.5 9.5 0 01-8.49 7.54zm5.22-7.14c-.29-.15-1.7-.84-1.96-.94s-.45-.15-.64.15-.74.94-.9 1.13-.33.22-.61.07a7.7 7.7 0 01-2.27-1.4 8.5 8.5 0 01-1.57-1.95c-.16-.29 0-.45.12-.6s.29-.33.44-.5.2-.29.3-.48a.5.5 0 00-.02-.48c-.07-.15-.64-1.54-.88-2.11s-.47-.49-.64-.5h-.55a1.06 1.06 0 00-.77.36 3.24 3.24 0 00-1 2.41 5.63 5.63 0 001.18 3 11.4 11.4 0 004.4 3.89 15.4 15.4 0 001.53.57 3.7 3.7 0 001.7.11 2.77 2.77 0 001.82-1.28 2.25 2.25 0 00.16-1.28c-.07-.13-.26-.2-.55-.35z" /></svg>
        <motion.span
          initial={{ opacity: 0, x: 8, scale: 0.95 }}
          whileHover={{ opacity: 1, x: 0, scale: 1 }}
          className="pointer-events-none absolute right-16 top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full bg-[#1a0f12] px-3 py-1.5 text-[12px] font-medium text-white shadow-lg sm:block"
        >Chat on WhatsApp</motion.span>
      </motion.a>

      {/* ── MOBILE STICKY CTA ── */}
      <motion.div
        initial={{ y: 80 }} animate={{ y: 0 }} transition={{ delay: 1.5, type: "spring", stiffness: 180 }}
        className="fixed inset-x-0 bottom-0 z-30 border-t p-4 backdrop-blur sm:hidden"
        style={{ borderColor: "var(--border)", backgroundColor: isDark ? "rgba(12,9,16,0.92)" : "rgba(255,255,255,0.9)" }}
      >
        <div className="flex justify-center">
          <MagneticBtn 
            onClick={() => scrollTo("contact")} 
            className="w-full max-w-[320px] rounded-full bg-[#5E0B1D] py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-[#5E0B1D]/20"
          >
            Book a Free Consultation
          </MagneticBtn>
        </div>
      </motion.div>

      {/* ── PREVIEW MODAL ── */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
                <div>
                  <h3 className="font-semibold text-lg">Live Website Preview</h3>
                  <p className="text-sm text-gray-500">Scroll-only preview — clicks are disabled</p>
                </div>
                <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={() => setShowPreview(false)} className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </motion.button>
              </div>
              <div className="flex-1 overflow-y-auto overflow-x-hidden relative bg-gray-100">
                <div className="absolute inset-0 z-10 w-full h-[5000px] cursor-ns-resize" />
                <iframe src={previewUrl} className="w-full h-[5000px] border-none" title="Website Preview" sandbox="allow-same-origin allow-scripts" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── ROUTING ── */
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isClientLoggedIn, setIsClientLoggedIn] = useState(false);
  
  useEffect(() => {
    if (localStorage.getItem("adminLoggedIn")) setIsLoggedIn(true);
    if (localStorage.getItem("clientLoggedIn")) setIsClientLoggedIn(true);
  }, []);
  
  return (
    <ThemeProvider>
      <Router>
        <Routes>
        <Route path="/admin" element={isLoggedIn ? <AdminDashboard /> : <AdminLogin onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/client" element={isClientLoggedIn ? <ClientDashboard /> : <ClientLogin onLogin={() => setIsClientLoggedIn(true)} />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/" element={<MainSite />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
