/**
 * useFirebase — Central data hook
 *
 * Tries Firebase first. If Firebase is not configured or offline,
 * automatically falls back to localStorage so the site never breaks.
 */

import { useState, useEffect, useCallback } from "react";
import {
  getSiteContent,
  updateSiteContent,
  getServices,
  getProjects,
  getTestimonials,
  getClients,
  saveProject,
  deleteProject as fbDeleteProject,
  saveTestimonial,
  deleteTestimonial as fbDeleteTestimonial,
  updateService,
  deleteService as fbDeleteService,
  saveClient,
  deleteClient as fbDeleteClient,
  updateClientProgress as fbUpdateClientProgress,
  saveLead,
  getLeads,
  updateLeadStatus as fbUpdateLeadStatus,
  onSiteContentChange,
  onProjectsChange,
  seedInitialData,
  uploadImage,
  type SiteContent,
  type Service,
  type Project,
  type Testimonial,
  type Client,
  type Lead,
} from "./firebase";

interface BlogPost {
  id: string; title: string; excerpt: string;
  content: string; image: string; date: string; published: boolean;
  template?: "standard" | "modern" | "minimal";
}

// ─── Firebase availability is detected via try/catch on first connection ─────

// Default fallback data (same as before)
const defaultContent: SiteContent = {
  hero: {
    headline: "Premium Websites That Grow Your Business",
    subheadline: "We build modern, fast, and conversion-focused websites for ambitious businesses ready to stand out online.",
    ctaPrimary: "Book a Free Consultation",
    ctaSecondary: "View Our Services",
  },
  about: {
    title: "Why Businesses Choose Ambassador Cre8tive",
    content: "We help businesses establish a strong online presence with premium website design, modern user experience, mobile responsiveness, SEO optimization, and conversion-focused layouts.",
  },
  contact: { email: "ambassadorcre8tive@gmail.com", phone: "+2349030192034", location: "Ibadan, Nigeria" },
  social: { instagram: "", twitter: "", linkedin: "", facebook: "", tiktok: "" },
  logo: "/logo.png",
  name: "Ambassador Cre8tive",
  tagline: "Premium Web Agency",
};

const defaultServices: Service[] = [
  { id: "1", title: "Business Website Development", desc: "Custom, fast, and scalable websites that establish credibility and drive growth.", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", order: 1 },
  { id: "2", title: "E-commerce Website Design", desc: "High-converting stores with seamless checkout and premium shopping experience.", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z", order: 2 },
  { id: "3", title: "Landing Page Design", desc: "Focused pages engineered for maximum conversions and lead generation.", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", order: 3 },
  { id: "4", title: "Website Redesign", desc: "Transform outdated sites into modern, premium digital experiences.", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", order: 4 },
  { id: "5", title: "Portfolio Websites", desc: "Showcase your work with elegant, memorable portfolio experiences.", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", order: 5 },
  { id: "6", title: "Maintenance & Support", desc: "Ongoing care, updates, and optimization to keep you ahead.", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z", order: 6 },
];

const defaultProjects: Project[] = [
  { id: "1", title: "Corporate", url: "https://example.com", image: "https://images.pexels.com/photos/1181449/pexels-photo-1181449.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", tag: "B2B Platform", featured: true, order: 1 },
  { id: "2", title: "Fashion Brand", url: "https://example.com", image: "https://images.pexels.com/photos/6956915/pexels-photo-6956915.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", tag: "E-commerce", featured: true, order: 2 },
  { id: "3", title: "Real Estate", url: "https://example.com", image: "https://images.pexels.com/photos/14998334/pexels-photo-14998334.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", tag: "Listings", featured: false, order: 3 },
  { id: "4", title: "Restaurant", url: "https://example.com", image: "https://images.pexels.com/photos/612790/pexels-photo-612790.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", tag: "Reservations", featured: false, order: 4 },
  { id: "5", title: "Tech Startup", url: "https://example.com", image: "https://images.pexels.com/photos/27141307/pexels-photo-27141307.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", tag: "SaaS Dashboard", featured: true, order: 5 },
  { id: "6", title: "E-commerce Store", url: "https://example.com", image: "https://images.pexels.com/photos/5632391/pexels-photo-5632391.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", tag: "Shopify Plus", featured: false, order: 6 },
];

const defaultTestimonials: Testimonial[] = [
  { id: "1", name: "Amara O.", role: "Founder, LUXE Fashion", quote: "Ambassador Cre8tive transformed our online store. Sales increased 180% in 2 months.", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200", rating: 5, featured: true, order: 1 },
  { id: "2", name: "David E.", role: "CEO, PropView Realty", quote: "Professional, fast, and detail-oriented. Our new website generates qualified leads daily.", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200", rating: 5, featured: true, order: 2 },
  { id: "3", name: "Chioma N.", role: "Director, Savory Kitchen", quote: "They understood our brand perfectly. The booking system is seamless.", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200", rating: 5, featured: true, order: 3 },
];

// ── localStorage helpers (fallback) ──────────────────────────────────────────
const ls = {
  get: (key: string, fallback: any) => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set: (key: string, value: any) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SITE DATA HOOK
// ─────────────────────────────────────────────────────────────────────────────

export function useSiteData() {
  const [siteContent, setSiteContent] = useState<SiteContent>(
    ls.get("siteContent", defaultContent)
  );
  const [services, setServices] = useState<Service[]>(
    ls.get("services", defaultServices)
  );
  const [projects, setProjects] = useState<Project[]>(
    ls.get("projects", defaultProjects)
  );
  const [testimonials, setTestimonials] = useState<Testimonial[]>(
    ls.get("testimonials", defaultTestimonials)
  );
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubContent: (() => void) | null = null;
    let unsubProjects: (() => void) | null = null;

    async function init() {
      try {
        // Try to fetch from Firebase
        const [fbContent, fbServices, fbProjects, fbTestimonials] = await Promise.all([
          getSiteContent(),
          getServices(),
          getProjects(),
          getTestimonials(),
        ]);

        if (fbContent) {
          setSiteContent(fbContent);
          ls.set("siteContent", fbContent);
        }
        if (fbServices.length > 0) {
          setServices(fbServices);
          ls.set("services", fbServices);
        }
        if (fbProjects.length > 0) {
          setProjects(fbProjects);
          ls.set("projects", fbProjects);
        }
        if (fbTestimonials.length > 0) {
          setTestimonials(fbTestimonials);
          ls.set("testimonials", fbTestimonials);
        }

        // If fresh DB, seed it
        if (!fbContent) {
          await seedInitialData();
        }

        // Subscribe to real-time updates
        unsubContent = onSiteContentChange((content) => {
          if (content) {
            setSiteContent(content);
            ls.set("siteContent", content);
          }
        });

        unsubProjects = onProjectsChange((projects) => {
          setProjects(projects);
          ls.set("projects", projects);
        });

        setFirebaseReady(true);
      } catch (err) {
        console.warn("Firebase unavailable, using localStorage:", err);
        setFirebaseReady(false);
      } finally {
        setLoading(false);
      }
    }

    init();

    return () => {
      unsubContent?.();
      unsubProjects?.();
    };
  }, []);

  return { siteContent, services, projects, testimonials, loading, firebaseReady };
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN DATA HOOK
// ─────────────────────────────────────────────────────────────────────────────

export function useAdminData() {
  const [siteContent, setSiteContentState] = useState<SiteContent>(
    ls.get("siteContent", defaultContent)
  );
  const [services, setServicesState] = useState<Service[]>(
    ls.get("services", defaultServices)
  );
  const [projects, setProjectsState] = useState<Project[]>(
    ls.get("projects", defaultProjects)
  );
  const [testimonials, setTestimonialsState] = useState<Testimonial[]>(
    ls.get("testimonials", defaultTestimonials)
  );
  const [clients, setClientsState] = useState<Client[]>(
    ls.get("clients", [])
  );
  const [leads, setLeadsState] = useState<Lead[]>([]);
  const [blogs, setBlogsState] = useState<BlogPost[]>(
    ls.get("blogs", [
      { id: "1", title: "5 Web Design Trends That Will Dominate 2026", excerpt: "Discover the latest design trends shaping the future of web development.", content: "", image: "https://images.pexels.com/photos/1181449/pexels-photo-1181449.jpeg?auto=compress&cs=tinysrgb&w=800", date: "2026-01-15", published: true },
      { id: "2", title: "Why Your Business Needs a Premium Website", excerpt: "Learn how premium web design can transform your business.", content: "", image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800", date: "2026-01-10", published: true },
    ])
  );
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [firebaseReady, setFirebaseReady] = useState(false);

  // ── Auto-Save Effect ──────────────────────────────────────────────────────
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSaveStatus("saving");
      
      // 1. Save to LocalStorage (Instant)
      ls.set("siteContent", siteContent);
      ls.set("services", services);
      ls.set("projects", projects);
      ls.set("testimonials", testimonials);
      ls.set("clients", clients);
      ls.set("blogs", blogs);

      // 2. Save to Firebase (Background)
      if (firebaseReady) {
        Promise.all([
          updateSiteContent(siteContent),
          ...services.map(s => updateService(s)),
          ...projects.map(p => saveProject(p)),
          ...testimonials.map(t => saveTestimonial(t)),
          ...clients.map(c => saveClient(c)),
        ]).then(() => {
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        }).catch(() => {
          setSaveStatus("error");
        });
      } else {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      }
    }, 1000); // 1 second debounce after typing stops

    return () => clearTimeout(timeoutId);
  }, [siteContent, services, projects, testimonials, clients, blogs, firebaseReady]);

  useEffect(() => {
    async function loadAll() {
      try {
        const [fbContent, fbServices, fbProjects, fbTestimonials, fbClients, fbLeads] = await Promise.all([
          getSiteContent(),
          getServices(),
          getProjects(),
          getTestimonials(),
          getClients(),
          getLeads(),
        ]);
        if (fbContent) { setSiteContentState(fbContent); ls.set("siteContent", fbContent); }
        if (fbServices.length > 0) { setServicesState(fbServices); ls.set("services", fbServices); }
        if (fbProjects.length > 0) { setProjectsState(fbProjects); ls.set("projects", fbProjects); }
        if (fbTestimonials.length > 0) { setTestimonialsState(fbTestimonials); ls.set("testimonials", fbTestimonials); }
        if (fbClients.length > 0) { setClientsState(fbClients); ls.set("clients", fbClients); }
        setLeadsState(fbLeads);
        setFirebaseReady(true);
      } catch (err) {
        console.warn("Firebase unavailable, using localStorage:", err);
        setFirebaseReady(false);
      }
    }
    loadAll();
  }, []);



  // ── Projects ─────────────────────────────────────────────────────────────
  const addProject = useCallback(async (project: Omit<Project, "order" | "featured">) => {
    const newProject: Project = { ...project, order: projects.length + 1, featured: false };
    const updated = [...projects, newProject];
    setProjectsState(updated);
    ls.set("projects", updated);
    if (firebaseReady) {
      try { await saveProject(newProject); } catch {}
    }
  }, [projects, firebaseReady]);

  const removeProject = useCallback(async (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    setProjectsState(updated);
    ls.set("projects", updated);
    if (firebaseReady) {
      try { await fbDeleteProject(id); } catch {}
    }
  }, [projects, firebaseReady]);

  // ── Services ─────────────────────────────────────────────────────────────
  const addService = useCallback((service: Omit<Service, "order">) => {
    const newService: Service = { ...service, order: services.length + 1 };
    const updated = [...services, newService];
    setServicesState(updated);
    ls.set("services", updated);
    if (firebaseReady) updateService(newService).catch(() => {});
  }, [services, firebaseReady]);

  const removeService = useCallback((id: string) => {
    const updated = services.filter(s => s.id !== id);
    setServicesState(updated);
    ls.set("services", updated);
    if (firebaseReady) fbDeleteService(id).catch(() => {});
  }, [services, firebaseReady]);

  // ── Testimonials ─────────────────────────────────────────────────────────
  const addTestimonial = useCallback((t: Testimonial) => {
    const updated = [...testimonials, t];
    setTestimonialsState(updated);
    ls.set("testimonials", updated);
    if (firebaseReady) saveTestimonial(t).catch(() => {});
  }, [testimonials, firebaseReady]);

  const removeTestimonial = useCallback((id: string) => {
    const updated = testimonials.filter(t => t.id !== id);
    setTestimonialsState(updated);
    ls.set("testimonials", updated);
    if (firebaseReady) fbDeleteTestimonial(id).catch(() => {});
  }, [testimonials, firebaseReady]);

  // ── Image Upload ─────────────────────────────────────────────────────────
  const uploadProjectImage = useCallback(async (file: File) => {
    if (!firebaseReady) {
      alert("Firebase is not connected. Cannot upload images.");
      return null;
    }
    const result = await uploadImage(file, "projects");
    return result.success ? result.url : null;
  }, [firebaseReady]);

  const uploadTestimonialImage = useCallback(async (file: File) => {
    if (!firebaseReady) {
      alert("Firebase is not connected. Cannot upload images.");
      return null;
    }
    const result = await uploadImage(file, "testimonials");
    return result.success ? result.url : null;
  }, [firebaseReady]);

  // ── Clients ──────────────────────────────────────────────────────────────
  const addClient = useCallback(async (client: Client) => {
    const updated = [...clients, client];
    setClientsState(updated);
    ls.set("clients", updated);
    if (firebaseReady) {
      try { await saveClient(client); } catch {}
    }
  }, [clients, firebaseReady]);

  const removeClient = useCallback(async (id: string) => {
    const updated = clients.filter(c => c.id !== id);
    setClientsState(updated);
    ls.set("clients", updated);
    if (firebaseReady) {
      try { await fbDeleteClient(id); } catch {}
    }
  }, [clients, firebaseReady]);

  const updateProgress = useCallback(async (id: string, progress: number) => {
    const updated = clients.map(c => c.id === id ? { ...c, progress } : c);
    setClientsState(updated);
    ls.set("clients", updated);
    if (firebaseReady) {
      try { await fbUpdateClientProgress(id, progress); } catch {}
    }
  }, [clients, firebaseReady]);

  // ── Lead status ──────────────────────────────────────────────────────────
  const updateLeadStatus = useCallback(async (id: string, status: Lead["status"]) => {
    const updated = leads.map(l => l.id === id ? { ...l, status } : l);
    setLeadsState(updated);
    if (firebaseReady) {
      try { await fbUpdateLeadStatus(id, status); } catch {}
    }
  }, [leads, firebaseReady]);

  return {
    // State
    siteContent, setSiteContent: setSiteContentState,
    services, setServices: setServicesState,
    projects, setProjects: setProjectsState,
    testimonials, setTestimonials: setTestimonialsState,
    clients, leads,
    blogs, setBlogs: setBlogsState,
    // Status
    saveStatus, firebaseReady,
    // Actions
    addProject, removeProject,
    addService, removeService,
    addTestimonial, removeTestimonial,
    addClient, removeClient, updateProgress,
    updateLeadStatus,
    uploadProjectImage,
    uploadTestimonialImage,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT FORM SUBMISSION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Web3Forms access key – delivers form submissions directly to
 * ambassadorcre8tive@gmail.com (no backend or SMTP server needed).
 */
const WEB3FORMS_ACCESS_KEY = "6033084c-6aea-473f-ab5f-d5c31da00005";
const RECIPIENT_EMAIL = "ambassadorcre8tive@gmail.com";

/**
 * Send the lead via Web3Forms → email delivery
 */
async function sendToEmail(data: {
  name: string;
  email: string;
  phone?: string;
  business?: string;
  details: string;
}) {
  const formData = new FormData();
  formData.append("access_key", WEB3FORMS_ACCESS_KEY);
  formData.append("subject", `🌟 New Lead from ${data.name} – Ambassador Cre8tive`);
  formData.append("from_name", "Ambassador Cre8tive Website");
  formData.append("to", RECIPIENT_EMAIL);
  formData.append("replyto", data.email);
  formData.append("name", data.name);
  formData.append("email", data.email);
  formData.append("phone", data.phone || "Not provided");
  formData.append("business", data.business || "Not provided");
  formData.append("message", data.details);
  formData.append("botcheck", ""); // honey-pot spam protection

  const response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    body: formData,
  });
  return response.ok;
}

/**
 * Submit the contact form
 *   1. Send to email via Web3Forms (always)
 *   2. Save to Firestore as a Lead (always, when Firebase reachable)
 *   3. Open a pre-filled WhatsApp chat (always)
 *
 * Each delivery channel runs independently so one failure does not block the
 * others. Returns immediately so the UI feels instant.
 */
export async function submitContactForm(data: {
  name: string;
  email: string;
  phone?: string;
  business?: string;
  details: string;
}) {
  // Fire all three channels in parallel
  const channels = await Promise.allSettled([
    // 1️⃣  Email via Web3Forms
    sendToEmail(data),

    // 2️⃣  Firestore lead record
    saveLead({
      name: data.name,
      email: data.email,
      phone: data.phone,
      business: data.business,
      message: data.details,
      source: "contact_form",
      status: "new",
    }),
  ]);

  // 3️⃣  Open WhatsApp (always last so it doesn't block the email POST)
  const msg = `Hello Ambassador Cre8tive!%0A%0AName: ${data.name}%0ABusiness: ${data.business || ""}%0AEmail: ${data.email}%0APhone: ${data.phone || ""}%0AProject: ${data.details}`;
  window.open(`https://wa.me/2349030192034?text=${msg}`, "_blank");

  const emailOK = channels[0].status === "fulfilled" && channels[0].value === true;
  const firebaseOK = channels[1].status === "fulfilled";

  return {
    success: true,
    emailDelivered: emailOK,
    leadSaved: firebaseOK,
  };
}
