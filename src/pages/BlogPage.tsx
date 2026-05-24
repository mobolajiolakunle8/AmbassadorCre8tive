import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ThemeStyles, useTheme } from "../components/ThemeProvider";
import { useSiteData } from "../lib/useFirebase";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  published: boolean;
  template?: "standard" | "modern" | "minimal";
}

export default function BlogPage() {
  const { blogs: fbBlogs, loading } = useSiteData() as any;
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  useTheme();

  useEffect(() => {
    if (fbBlogs && fbBlogs.length > 0) {
      setBlogs(fbBlogs.filter((b: any) => b.published));
    } else {
      const saved = localStorage.getItem("blogs");
      if (saved) {
        const all: BlogPost[] = JSON.parse(saved);
        setBlogs(all.filter((b) => b.published));
      }
    }
  }, [fbBlogs]);

  if (loading && blogs.length === 0) return <div className="min-h-screen grid place-items-center"><div className="h-10 w-10 border-4 border-[#5E0B1D] border-t-transparent rounded-full animate-spin" /></div>;

  if (selectedPost) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
        <ThemeStyles />
        {/* Article Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ backgroundColor: "var(--bg-glass)", borderColor: "var(--border)" }}>
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <button onClick={() => setSelectedPost(null)} className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition" style={{ color: "var(--brand)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              All Posts
            </button>
            <a href="#/" className="text-sm font-medium opacity-60 hover:opacity-100 transition">← Main Site</a>
          </div>
        </header>

        <article className={`mx-auto px-4 py-12 ${selectedPost.template === "minimal" ? "max-w-2xl" : "max-w-3xl"}`}>
          {selectedPost.template !== "modern" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <time className="text-sm opacity-50">{new Date(selectedPost.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</time>
              <h1 className={`mt-2 font-semibold leading-tight ${selectedPost.template === "minimal" ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl"}`} style={{ fontFamily: "Poppins, sans-serif" }}>
                {selectedPost.title}
              </h1>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full grid place-items-center text-white font-bold" style={{ backgroundColor: "var(--brand)" }}>A</div>
                <div>
                  <div className="text-sm font-medium">Ambassador Cre8tive</div>
                  <div className="text-xs opacity-50">Premium Web Agency</div>
                </div>
              </div>
            </motion.div>
          )}

          {selectedPost.template === "modern" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative h-[400px] sm:h-[500px] rounded-3xl overflow-hidden mb-12">
              <img src={selectedPost.image} alt={selectedPost.title} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 sm:p-12">
                <time className="text-sm text-white/60 mb-2">{new Date(selectedPost.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</time>
                <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>{selectedPost.title}</h1>
                <div className="flex items-center gap-3 text-white">
                  <div className="h-10 w-10 rounded-full border-2 border-white/20 grid place-items-center font-bold">A</div>
                  <div className="text-sm font-medium">Ambassador Cre8tive</div>
                </div>
              </div>
            </motion.div>
          )}

          {selectedPost.template === "standard" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-8 rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
              <img src={selectedPost.image} alt={selectedPost.title} className="w-full aspect-[2/1] object-cover" />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`mt-10 prose max-w-none ${selectedPost.template === "minimal" ? "prose-xl text-center" : "prose-lg"}`}
            style={{ color: "var(--text-faint)" }}
          >
            {selectedPost.content.split("\n\n").map((paragraph, i) => {
              if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                return <h2 key={i} className="text-xl font-semibold mt-8 mb-3" style={{ color: "var(--text)" }}>{paragraph.replace(/\*\*/g, "")}</h2>;
              }
              if (paragraph.startsWith("**")) {
                const parts = paragraph.split("**");
                return (
                  <p key={i} className="mb-4 text-[16px] leading-relaxed">
                    {parts.map((part, j) => j % 2 === 1 ? <strong key={j} style={{ color: "var(--text)" }}>{part}</strong> : part)}
                  </p>
                );
              }
              return <p key={i} className="mb-4 text-[16px] leading-relaxed">{paragraph}</p>;
            })}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 p-8 rounded-2xl text-center text-white"
            style={{ background: "linear-gradient(135deg, #5E0B1D, #8B1538)" }}
          >
            <h3 className="text-xl font-semibold">Ready to build your premium website?</h3>
            <p className="mt-2 opacity-80">Book a free consultation with Ambassador Cre8tive today.</p>
            <a href="#/" className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-white rounded-full font-semibold text-sm" style={{ color: "#5E0B1D" }}>
              Get Started <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
            </a>
          </motion.div>
        </article>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
      <ThemeStyles />
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ backgroundColor: "var(--bg-glass)", borderColor: "var(--border)" }}>
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl grid place-items-center text-white font-bold" style={{ background: "linear-gradient(135deg, #5E0B1D, #7A1128)" }}>A</div>
            <div>
              <div className="font-semibold text-sm">Ambassador Cre8tive</div>
              <div className="text-xs opacity-50">Blog</div>
            </div>
          </div>
          <a href="#/" className="text-sm font-medium px-4 py-2 rounded-full transition" style={{ color: "var(--brand)", border: "1px solid var(--border-strong)" }}>
            ← Back to Site
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl sm:text-4xl font-semibold" style={{ fontFamily: "Poppins, sans-serif" }}>Blog</h1>
          <p className="mt-2 text-lg opacity-60">Insights, tips, and trends from the Ambassador Cre8tive team.</p>
        </motion.div>

        {blogs.length === 0 && !loading && (
          <div className="mt-16 text-center opacity-50">
            <p>No published posts yet. Check back soon!</p>
          </div>
        )}

        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              onClick={() => setSelectedPost(post)}
              className="group cursor-pointer rounded-2xl overflow-hidden transition-shadow hover:shadow-xl"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <div className="aspect-[3/2] overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <time className="text-xs opacity-50">{new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</time>
                <h2 className="mt-2 text-lg font-semibold leading-snug line-clamp-2">{post.title}</h2>
                <p className="mt-2 text-sm opacity-60 line-clamp-3">{post.excerpt}</p>
                <span className="inline-flex items-center gap-1 mt-4 text-sm font-medium transition" style={{ color: "var(--brand)" }}>
                  Read More <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </main>
    </div>
  );
}
