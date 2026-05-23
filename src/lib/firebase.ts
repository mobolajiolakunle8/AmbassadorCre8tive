import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  type User
} from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Firebase Configuration
 * Ambassador Cre8tive Official Firebase Project
 * 
 * Project ID: ambassadorcre8tive-website
 * Database: https://ambassadorcre8tive-website-default-rtdb.firebaseio.com/
 */
const firebaseConfig = {
  apiKey: "AIzaSyDUuubrhDgzQ9lb-7YKo9lpSn3gtYXM5BE",
  authDomain: "ambassadorcre8tive-website.firebaseapp.com",
  databaseURL: "https://ambassadorcre8tive-website-default-rtdb.firebaseio.com",
  projectId: "ambassadorcre8tive-website",
  storageBucket: "ambassadorcre8tive-website.firebasestorage.app",
  messagingSenderId: "575761171643",
  appId: "1:575761171643:web:09201e3f87d517e4c2959e",
  measurementId: "G-YHF4WLZGL5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser, not SSR)
export const analytics = typeof window !== "undefined" ? (async () => {
  if (await isSupported()) {
    return getAnalytics(app);
  }
  return null;
})() : null;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface SiteContent {
  hero: {
    headline: string;
    subheadline: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  about: {
    title: string;
    content: string;
  };
  contact: {
    email: string;
    phone: string;
  };
  updatedAt?: Timestamp;
}

export interface Service {
  id: string;
  title: string;
  desc: string;
  icon: string;
  order: number;
}

export interface Project {
  id: string;
  title: string;
  url: string;
  tag: string;
  image: string;
  featured: boolean;
  order: number;
  createdAt?: Timestamp;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  img: string;
  rating: number;
  featured: boolean;
  order: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  business: string;
  projectName: string;
  projectType: string;
  status: "planning" | "design" | "development" | "review" | "launched";
  progress: number;
  startDate: string;
  estimatedLaunch: string;
  managerName: string;
  managerEmail: string;
  createdAt?: Timestamp;
  lastLoginAt?: Timestamp;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  business?: string;
  message: string;
  source: "contact_form" | "whatsapp" | "client_portal";
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  createdAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTHENTICATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Admin login using Firebase Auth
 */
export async function adminLogin(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Store admin flag
    localStorage.setItem("adminLoggedIn", "true");
    localStorage.setItem("adminUid", userCredential.user.uid);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Client login - checks Firestore for client credentials
 * (In production, use Firebase Auth with custom claims)
 */
export async function clientLogin(email: string, password: string) {
  try {
    const clientsRef = collection(db, "clients");
    const q = query(clientsRef, where("email", "==", email), where("password", "==", password));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const clientDoc = snapshot.docs[0];
      const clientData = { id: clientDoc.id, ...clientDoc.data() } as Client;
      
      // Update last login
      await updateDoc(doc(db, "clients", clientDoc.id), {
        lastLoginAt: serverTimestamp()
      });
      
      localStorage.setItem("clientLoggedIn", "true");
      localStorage.setItem("clientData", JSON.stringify(clientData));
      return { success: true, client: clientData };
    }
    
    // Fallback demo
    if (email === "client@demo.com" && password === "client123") {
      const demoClient = {
        id: "demo",
        name: "Demo Client",
        email: "client@demo.com",
        business: "Demo Business",
        projectName: "Premium Business Website",
        projectType: "Business Website",
        status: "development" as const,
        progress: 65,
        startDate: "2026-01-15",
        estimatedLaunch: "2026-02-15",
        managerName: "Alex Morgan",
        managerEmail: "alex@ambassadorcre8tive.com",
      };
      localStorage.setItem("clientLoggedIn", "true");
      localStorage.setItem("clientData", JSON.stringify(demoClient));
      return { success: true, client: demoClient };
    }
    
    return { success: false, error: "Invalid credentials" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function logout() {
  await signOut(auth);
  localStorage.removeItem("adminLoggedIn");
  localStorage.removeItem("adminUid");
  localStorage.removeItem("clientLoggedIn");
  localStorage.removeItem("clientData");
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ─────────────────────────────────────────────────────────────────────────────
// SITE CONTENT (CMS)
// ─────────────────────────────────────────────────────────────────────────────

const SITE_DOC_ID = "main";

/**
 * Get site content
 */
export async function getSiteContent(): Promise<SiteContent | null> {
  try {
    const docRef = doc(db, "siteContent", SITE_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as SiteContent;
    }
    return null;
  } catch (error) {
    console.error("Error getting site content:", error);
    return null;
  }
}

/**
 * Update site content
 */
export async function updateSiteContent(content: Partial<SiteContent>) {
  try {
    const docRef = doc(db, "siteContent", SITE_DOC_ID);
    await setDoc(docRef, { ...content, updatedAt: serverTimestamp() }, { merge: true });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Listen to site content changes in real-time
 */
export function onSiteContentChange(callback: (content: SiteContent | null) => void) {
  const docRef = doc(db, "siteContent", SITE_DOC_ID);
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as SiteContent);
    } else {
      callback(null);
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICES
// ─────────────────────────────────────────────────────────────────────────────

export async function getServices(): Promise<Service[]> {
  try {
    const snapshot = await getDocs(collection(db, "services"));
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Service))
      .sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error("Error getting services:", error);
    return [];
  }
}

export async function updateService(service: Service) {
  try {
    await setDoc(doc(db, "services", service.id), service);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteService(id: string) {
  try {
    await deleteDoc(doc(db, "services", id));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PROJECTS (PORTFOLIO)
// ─────────────────────────────────────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  try {
    const snapshot = await getDocs(collection(db, "projects"));
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Project))
      .sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error("Error getting projects:", error);
    return [];
  }
}

export async function saveProject(project: Omit<Project, "createdAt">) {
  try {
    const projectData = {
      ...project,
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, "projects", project.id), projectData);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProject(id: string) {
  try {
    await deleteDoc(doc(db, "projects", id));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export function onProjectsChange(callback: (projects: Project[]) => void) {
  return onSnapshot(collection(db, "projects"), (snapshot) => {
    const projects = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Project))
      .sort((a, b) => a.order - b.order);
    callback(projects);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// TESTIMONIALS
// ─────────────────────────────────────────────────────────────────────────────

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const snapshot = await getDocs(collection(db, "testimonials"));
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Testimonial))
      .sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error("Error getting testimonials:", error);
    return [];
  }
}

export async function saveTestimonial(testimonial: Testimonial) {
  try {
    await setDoc(doc(db, "testimonials", testimonial.id), testimonial);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTestimonial(id: string) {
  try {
    await deleteDoc(doc(db, "testimonials", id));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CLIENTS
// ─────────────────────────────────────────────────────────────────────────────

export async function getClients(): Promise<Client[]> {
  try {
    const snapshot = await getDocs(collection(db, "clients"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
  } catch (error) {
    console.error("Error getting clients:", error);
    return [];
  }
}

export async function saveClient(client: Omit<Client, "createdAt">) {
  try {
    const clientData = {
      ...client,
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, "clients", client.id), clientData);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateClientProgress(clientId: string, progress: number) {
  try {
    await updateDoc(doc(db, "clients", clientId), { progress });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteClient(id: string) {
  try {
    await deleteDoc(doc(db, "clients", id));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LEADS (Contact Form Submissions)
// ─────────────────────────────────────────────────────────────────────────────

export async function saveLead(lead: Omit<Lead, "id" | "createdAt">) {
  try {
    const leadRef = doc(collection(db, "leads"));
    await setDoc(leadRef, {
      ...lead,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: leadRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getLeads(): Promise<Lead[]> {
  try {
    const snapshot = await getDocs(collection(db, "leads"));
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Lead))
      .sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
  } catch (error) {
    console.error("Error getting leads:", error);
    return [];
  }
}

export async function updateLeadStatus(leadId: string, status: Lead["status"]) {
  try {
    await updateDoc(doc(db, "leads", leadId), { status });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE UPLOADS
// ─────────────────────────────────────────────────────────────────────────────

export async function uploadFile(file: File, path: string) {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return { success: true, url };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL DATA SEED (Run once)
// ─────────────────────────────────────────────────────────────────────────────

export async function seedInitialData() {
  try {
    // Check if already seeded
    const siteDoc = await getDoc(doc(db, "siteContent", SITE_DOC_ID));
    if (siteDoc.exists()) {
      return { success: false, message: "Already seeded" };
    }

    // Site content
    await setDoc(doc(db, "siteContent", SITE_DOC_ID), {
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
      contact: {
        email: "ambassadorcre8tive@gmail.com",
        phone: "+2349030192034",
      },
      updatedAt: serverTimestamp(),
    });

    // Services
    const services = [
      { id: "1", title: "Business Website Development", desc: "Custom, fast, and scalable websites that establish credibility and drive growth.", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", order: 1 },
      { id: "2", title: "E-commerce Website Design", desc: "High-converting stores with seamless checkout and premium shopping experience.", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z", order: 2 },
      { id: "3", title: "Landing Page Design", desc: "Focused pages engineered for maximum conversions and lead generation.", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", order: 3 },
      { id: "4", title: "Website Redesign", desc: "Transform outdated sites into modern, premium digital experiences.", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", order: 4 },
      { id: "5", title: "Portfolio Websites", desc: "Showcase your work with elegant, memorable portfolio experiences.", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", order: 5 },
      { id: "6", title: "Maintenance & Support", desc: "Ongoing care, updates, and optimization to keep you ahead.", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z", order: 6 },
    ];
    for (const service of services) {
      await setDoc(doc(db, "services", service.id), service);
    }

    // Projects
    const projects = [
      { id: "1", title: "Corporate", url: "https://example.com", image: "https://images.pexels.com/photos/1181449/pexels-photo-1181449.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", tag: "B2B Platform", featured: true, order: 1 },
      { id: "2", title: "Fashion Brand", url: "https://example.com", image: "https://images.pexels.com/photos/6956915/pexels-photo-6956915.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", tag: "E-commerce", featured: true, order: 2 },
      { id: "3", title: "Real Estate", url: "https://example.com", image: "https://images.pexels.com/photos/14998334/pexels-photo-14998334.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", tag: "Listings", featured: false, order: 3 },
      { id: "4", title: "Restaurant", url: "https://example.com", image: "https://images.pexels.com/photos/612790/pexels-photo-612790.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", tag: "Reservations", featured: false, order: 4 },
      { id: "5", title: "Tech Startup", url: "https://example.com", image: "https://images.pexels.com/photos/27141307/pexels-photo-27141307.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", tag: "SaaS Dashboard", featured: true, order: 5 },
      { id: "6", title: "E-commerce Store", url: "https://example.com", image: "https://images.pexels.com/photos/5632391/pexels-photo-5632391.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", tag: "Shopify Plus", featured: false, order: 6 },
    ];
    for (const project of projects) {
      await setDoc(doc(db, "projects", project.id), { ...project, createdAt: serverTimestamp() });
    }

    // Testimonials
    const testimonials = [
      { id: "1", name: "Amara O.", role: "Founder, LUXE Fashion", quote: "Ambassador Cre8tive transformed our online store. Sales increased 180% in 2 months. The design is stunning and converts like crazy.", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200", rating: 5, featured: true, order: 1 },
      { id: "2", name: "David E.", role: "CEO, PropView Realty", quote: "Professional, fast, and detail-oriented. Our new website generates qualified leads daily. Best investment we've made.", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200", rating: 5, featured: true, order: 2 },
      { id: "3", name: "Chioma N.", role: "Director, Savory Kitchen", quote: "They understood our brand perfectly. The booking system is seamless and our customers love the mobile experience.", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200", rating: 5, featured: true, order: 3 },
    ];
    for (const testimonial of testimonials) {
      await setDoc(doc(db, "testimonials", testimonial.id), testimonial);
    }

    return { success: true, message: "Initial data seeded successfully" };
  } catch (error: any) {
    console.error("Error seeding data:", error);
    return { success: false, error: error.message };
  }
}