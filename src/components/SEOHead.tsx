import { useEffect } from "react";

/**
 * SEOHead — Dynamic `<head>` tag manager
 * Injects meta tags, Open Graph, Twitter Cards, canonical, and JSON-LD
 * structured data without any external library.
 */

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}

function setMeta(property: string, content: string, attr: "name" | "property" = "name") {
  const selector = `meta[${attr}="${property}"]`;
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  const selector = `link[rel="${rel}"]`;
  let el = document.querySelector(selector) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

export default function SEOHead({
  title = "Ambassador Cre8tive — Premium Websites That Grow Your Business",
  description = "Premium web design & development agency in Ibadan, Nigeria. We build modern, fast, and conversion-focused websites for ambitious businesses ready to stand out online.",
  canonical,
  ogImage = "/images/hero-mockup.png",
  noindex = false,
}: SEOProps) {
  useEffect(() => {
    document.title = title;

    setMeta("description", description);
    setMeta("robots", noindex ? "noindex,nofollow" : "index,follow");

    // Open Graph
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:type", "website", "property");
    setMeta("og:image", ogImage, "property");
    setMeta("og:site_name", "Ambassador Cre8tive", "property");
    setMeta("og:locale", "en_NG", "property");
    if (canonical) setMeta("og:url", canonical, "property");

    // Twitter
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", ogImage);

    // Canonical
    if (canonical) {
      setLink("canonical", canonical);
    }
  }, [title, description, canonical, ogImage, noindex]);

  return null;
}

/* ─────────────────────────────────────────────────────────────
   JSON-LD STRUCTURED DATA COMPONENTS
   ───────────────────────────────────────────────────────────── */

/**
 * Inject a JSON-LD script block into `<head>`
 */
function JsonLd({ data, id }: { data: Record<string, any>; id: string }) {
  useEffect(() => {
    let el = document.getElementById(id) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.id = id;
      el.type = "application/ld+json";
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
    return () => {
      el?.remove();
    };
  }, [data, id]);
  return null;
}

/**
 * Organization schema — tells Google who the business is,
 * where it operates, and how to contact it.
 */
export function OrganizationSchema({
  name = "Ambassador Cre8tive",
  url,
  logo,
  email = "ambassadorcre8tive@gmail.com",
  phone = "+2349030192034",
  description = "Premium web design and development agency specializing in modern, conversion-focused websites for businesses.",
  address,
  sameAs = [],
}: {
  name?: string;
  url?: string;
  logo?: string;
  email?: string;
  phone?: string;
  description?: string;
  address?: { street?: string; city?: string; region?: string; country?: string; zip?: string };
  sameAs?: string[];
}) {
  const data: any = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name,
    alternateName: "Ambassador Cre8tive Web Agency",
    description,
    ...(url && { url }),
    ...(logo && { logo }),
    email,
    telephone: phone,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: phone,
      contactType: "customer service",
      availableLanguage: ["English"],
      areaServed: ["NG", "GB", "US", "GH", "KE", "ZA"],
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: address?.city || "Ibadan",
      addressRegion: address?.region || "Oyo",
      addressCountry: address?.country || "NG",
    },
    ...(sameAs.length > 0 && { sameAs }),
    priceRange: "$$",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    foundingDate: "2021",
    numberOfEmployees: {
      "@type": "QuantitativeValue",
      minValue: 2,
      maxValue: 10,
    },
  };

  return <JsonLd data={data} id="schema-organization" />;
}

/**
 * WebSite schema — enables sitelinks search box in Google SERPs
 */
export function WebSiteSchema({ name = "Ambassador Cre8tive", url }: { name?: string; url?: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    ...(url && { url }),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url || ""}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
  return <JsonLd data={data} id="schema-website" />;
}

/**
 * Service schema array — tells Google what services you offer.
 * This is what makes you appear in "web designer near me" searches
 * with rich detail.
 */
export function ServicesSchema({
  services,
  providerName = "Ambassador Cre8tive",
  areaServed = ["Ibadan", "Nigeria", "United Kingdom", "United States"],
}: {
  services: { title: string; desc: string }[];
  providerName?: string;
  areaServed?: string[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: services.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: s.title,
        description: s.desc,
        provider: {
          "@type": "Organization",
          name: providerName,
        },
        areaServed: areaServed.map((a) => ({
          "@type": "Place",
          name: a,
        })),
        serviceType: "Web Design and Development",
      },
    })),
  };
  return <JsonLd data={data} id="schema-services" />;
}

/**
 * Reviews / Testimonials schema — shows golden stars in Google SERPs.
 */
export function ReviewsSchema({
  reviews,
  itemName = "Ambassador Cre8tive Web Design Services",
}: {
  reviews: { name: string; role: string; quote: string }[];
  itemName?: string;
}) {
  const avgRating = 5; // All reviews are 5 stars
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: itemName,
    description: "Premium web design and development services for businesses",
    brand: {
      "@type": "Brand",
      name: "Ambassador Cre8tive",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: avgRating.toFixed(1),
      bestRating: "5",
      worstRating: "1",
      reviewCount: String(reviews.length),
    },
    review: reviews.map((r) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: r.name,
        jobTitle: r.role,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: "5",
        bestRating: "5",
      },
      reviewBody: r.quote,
    })),
  };
  return <JsonLd data={data} id="schema-reviews" />;
}

/**
 * FAQ schema — for process/FAQ sections.
 * This can win you the "People Also Ask" dropdown in Google.
 */
export function FAQSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
  return <JsonLd data={data} id="schema-faq" />;
}

/**
 * BreadcrumbList schema — tells Google the page hierarchy.
 */
export function BreadcrumbSchema({ items }: { items: { name: string; url?: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.url && { item: item.url }),
    })),
  };
  return <JsonLd data={data} id="schema-breadcrumb" />;
}

/**
 * LocalBusiness schema — for Google Maps / "near me" discovery.
 */
export function LocalBusinessSchema({
  name = "Ambassador Cre8tive",
  phone = "+2349030192034",
  email = "ambassadorcre8tive@gmail.com",
  url,
  image,
}: {
  name?: string;
  phone?: string;
  email?: string;
  url?: string;
  image?: string;
}) {
  const data: any = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": url ? `${url}/#business` : undefined,
    name,
    telephone: phone,
    email,
    ...(url && { url }),
    ...(image && { image }),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ibadan",
      addressRegion: "Oyo",
      addressCountry: "NG",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "7.3776",
      longitude: "3.9470",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
    ],
    priceRange: "$$",
    areaServed: [
      { "@type": "Country", name: "Nigeria" },
      { "@type": "Country", name: "United Kingdom" },
      { "@type": "Country", name: "United States" },
    ],
    knowsAbout: [
      "Web Design",
      "Web Development",
      "E-commerce Development",
      "UI/UX Design",
      "SEO Optimization",
      "Landing Page Design",
      "WordPress Development",
      "Shopify Development",
    ],
  };
  return <JsonLd data={data} id="schema-local-business" />;
}
