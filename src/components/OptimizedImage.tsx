import { useState, useEffect, useRef, type ImgHTMLAttributes } from "react";
import { motion } from "framer-motion";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * OptimizedImage
 * — Auto-converts Pexels / Unsplash URLs to WebP & AVIF
 * — Generates responsive srcsets (400 / 800 / 1200 / 1600 / 2000 px)
 * — Lazy-loads below-the-fold images via native `loading="lazy"` + IntersectionObserver
 * — Blur-up LQIP placeholder (tiny 20px image) for smooth perceived loading
 * — Connection-aware quality (drops to 60 on slow 3G / Save-Data)
 * — Skeleton shimmer until image is fully decoded
 */

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "loading"> {
  src: string;
  alt: string;
  className?: string;
  /** Render with high priority (above the fold) */
  priority?: boolean;
  /** Responsive sizes attribute, e.g. "(min-width:1024px) 50vw, 100vw" */
  sizes?: string;
  /** Optional aspect-ratio wrapper, e.g. "16/10" */
  aspectRatio?: string;
  /** Disable blur placeholder */
  noBlur?: boolean;
  /** Object-fit value, default "cover" */
  objectFit?: "cover" | "contain" | "fill" | "none";
}

/* ── URL helpers ─────────────────────────────────────────────── */

const isPexels = (u: string) => u.includes("pexels.com");
const isUnsplash = (u: string) => u.includes("unsplash.com");
const isThumIo = (u: string) => u.includes("thum.io");
const isLocal = (u: string) => u.startsWith("/") || u.startsWith("./");

function getQuality() {
  if (typeof navigator === "undefined") return 75;
  const c: any = (navigator as any).connection;
  if (c?.saveData) return 55;
  if (c?.effectiveType === "2g" || c?.effectiveType === "slow-2g") return 50;
  if (c?.effectiveType === "3g") return 65;
  return 75;
}

function buildPexelsUrl(src: string, w: number, fm: "webp" | "avif" | "jpeg", q: number) {
  // Strip existing format and width params, then rebuild
  const url = new URL(src);
  url.searchParams.set("auto", "compress");
  url.searchParams.set("cs", "tinysrgb");
  url.searchParams.set("fit", "crop");
  url.searchParams.set("w", String(w));
  url.searchParams.set("q", String(q));
  if (fm === "webp" || fm === "avif") {
    // Pexels supports fm=webp; for AVIF fall back to webp (Pexels doesn't natively support AVIF)
    url.searchParams.set("fm", fm === "avif" ? "webp" : "webp");
  }
  return url.toString();
}

function buildUnsplashUrl(src: string, w: number, fm: "webp" | "avif" | "jpeg", q: number) {
  const url = new URL(src);
  url.searchParams.set("auto", "format");
  url.searchParams.set("w", String(w));
  url.searchParams.set("q", String(q));
  url.searchParams.set("fm", fm);
  return url.toString();
}

function buildSrcSet(src: string, fm: "webp" | "avif" | "jpeg", widths: number[]) {
  const q = getQuality();
  return widths
    .map((w) => {
      if (isPexels(src)) return `${buildPexelsUrl(src, w, fm, q)} ${w}w`;
      if (isUnsplash(src)) return `${buildUnsplashUrl(src, w, fm, q)} ${w}w`;
      return `${src} ${w}w`;
    })
    .join(", ");
}

function buildLqip(src: string) {
  // ultra-low quality 20px placeholder
  if (isPexels(src)) return buildPexelsUrl(src, 20, "webp", 20);
  if (isUnsplash(src)) return buildUnsplashUrl(src, 20, "webp", 20);
  return null;
}

/* ── Component ───────────────────────────────────────────────── */

export default function OptimizedImage({
  src,
  alt,
  className = "",
  priority = false,
  sizes = "(min-width:1024px) 50vw, 100vw",
  aspectRatio,
  noBlur = false,
  objectFit = "cover",
  ...rest
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(priority);

  /* Defer remote image work until near viewport (saves bandwidth) */
  useEffect(() => {
    if (priority || inView || !wrapperRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { rootMargin: "300px" } // start fetching 300px before visible
    );
    obs.observe(wrapperRef.current);
    return () => obs.disconnect();
  }, [priority, inView]);

  const widths = [400, 800, 1200, 1600, 2000];
  const optimizable = isPexels(src) || isUnsplash(src);
  const fallbackSrc = optimizable
    ? isPexels(src)
      ? buildPexelsUrl(src, 1200, "jpeg", getQuality())
      : buildUnsplashUrl(src, 1200, "jpeg", getQuality())
    : src;
  const lqip = !noBlur && optimizable ? buildLqip(src) : null;

  /* Special handling for screenshot service (thum.io) — already auto-optimized */
  const isScreenshot = isThumIo(src);

  /* Local images: keep as-is, but add lazy + async */
  if (isLocal(src) || isScreenshot || errored) {
    return (
      <div
        ref={wrapperRef}
        className={`relative overflow-hidden ${className}`}
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        {!loaded && !errored && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#5E0B1D]/5 via-[#F7E9E2]/30 to-[#5E0B1D]/5" />
        )}
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          {...(priority ? { fetchPriority: "high" } : {})}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={`h-full w-full object-${objectFit} transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
          {...rest}
        />
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className={`relative overflow-hidden ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* LQIP blurred background */}
      {lqip && (
        <div
          aria-hidden
          className="absolute inset-0 scale-110 transform-gpu"
          style={{
            backgroundImage: `url(${lqip})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(24px) saturate(140%)",
            opacity: loaded ? 0 : 1,
            transition: "opacity 600ms ease-out",
          }}
        />
      )}

      {/* Skeleton if no LQIP */}
      {!lqip && !loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#5E0B1D]/5 via-[#F7E9E2]/30 to-[#5E0B1D]/5" />
      )}

      {inView && (
        <picture>
          {/* AVIF — Pexels still serves WebP; future-proof for CDN proxies */}
          <source
            type="image/avif"
            srcSet={buildSrcSet(src, "avif", widths)}
            sizes={sizes}
          />
          <source
            type="image/webp"
            srcSet={buildSrcSet(src, "webp", widths)}
            sizes={sizes}
          />
          <motion.img
            initial={{ opacity: 0, scale: 1.02 }}
            animate={loaded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            src={fallbackSrc}
            srcSet={buildSrcSet(src, "jpeg", widths)}
            sizes={sizes}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            {...(priority ? { fetchPriority: "high" } : {})}
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
            className={`relative h-full w-full object-${objectFit}`}
            {...(rest as any)}
          />
        </picture>
      )}
    </div>
  );
}


