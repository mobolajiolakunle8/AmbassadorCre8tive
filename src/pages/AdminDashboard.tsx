import { useState } from "react";
import { useAdminData } from "../lib/useFirebase";
import type { Client } from "../lib/firebase";

interface BlogPost {
  id: string; title: string; excerpt: string;
  content: string; image: string; date: string; published: boolean;
}

const ICON = {
  trash: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  close: "M6 18L18 6M6 6l12 12",
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [newProject, setNewProject] = useState({ title: "", url: "", tag: "", image: "" });
  const [generatingMockup, setGeneratingMockup] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [newClient, setNewClient] = useState<Partial<Client & { password: string }>>({
    status: "planning", progress: 0,
    startDate: new Date().toISOString().split("T")[0],
    estimatedLaunch: "", managerName: "Alex Morgan",
    managerEmail: "alex@ambassadorcre8tive.com",
  });

  const [blogs, setBlogs] = useState<BlogPost[]>([
    { id: "1", title: "5 Web Design Trends That Will Dominate 2026", excerpt: "Discover the latest design trends shaping the future of web development.", content: "", image: "https://images.pexels.com/photos/1181449/pexels-photo-1181449.jpeg?auto=compress&cs=tinysrgb&w=800", date: "2026-01-15", published: true },
    { id: "2", title: "Why Your Business Needs a Premium Website", excerpt: "Learn how premium web design can transform your business.", content: "", image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800", date: "2026-01-10", published: true },
  ]);

  /* ── Firebase-backed data hook ─────────────────────────────────────────── */
  const {
    siteContent, setSiteContent,
    services, setServices,
    projects, setProjects,
    testimonials, setTestimonials,
    clients,
    leads,
    saving, saveStatus, firebaseReady,
    saveAll,
    addProject: fbAddProject, removeProject,
    addService: fbAddService, removeService,
    addTestimonial: fbAddTestimonial, removeTestimonial,
    addClient: fbAddClient, removeClient, updateProgress,
    updateLeadStatus,
  } = useAdminData();

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    window.location.hash = "#/";
    window.location.reload();
  };

  const generateMockup = () => {
    if (!newProject.url) return;
    setGeneratingMockup(true);
    setTimeout(() => {
      setNewProject({ ...newProject, image: `https://image.thum.io/get/fullpage/${newProject.url}` });
      setGeneratingMockup(false);
    }, 1500);
  };

  const handleAddProject = () => {
    if (!newProject.title || !newProject.url) return;
    const project = {
      id: Date.now().toString(),
      title: newProject.title,
      url: newProject.url,
      tag: newProject.tag || "Website",
      image: newProject.image || `https://image.thum.io/get/fullpage/${newProject.url}`,
    };
    fbAddProject(project);
    setNewProject({ title: "", url: "", tag: "", image: "" });
  };

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.email || !newClient.password || !newClient.projectName) {
      alert("Please fill: Name, Email, Password, Project Name");
      return;
    }
    const client = {
      id: Date.now().toString(),
      name: newClient.name!,
      email: newClient.email!,
      password: newClient.password!,
      business: newClient.business || "",
      projectName: newClient.projectName!,
      projectType: newClient.projectType || "Business Website",
      status: (newClient.status || "planning") as Client["status"],
      progress: newClient.progress || 0,
      startDate: newClient.startDate || new Date().toISOString().split("T")[0],
      estimatedLaunch: newClient.estimatedLaunch || "",
      managerName: newClient.managerName || "Alex Morgan",
      managerEmail: newClient.managerEmail || "alex@ambassadorcre8tive.com",
    };

    await fbAddClient(client);

    // Also create a local client project for the portal
    const clientProjects = JSON.parse(localStorage.getItem("clientProjects") || "[]");
    clientProjects.push({
      clientId: client.id,
      id: `project-${client.id}`,
      name: client.projectName,
      businessName: client.business,
      type: client.projectType,
      status: client.status,
      startDate: client.startDate,
      estimatedLaunch: client.estimatedLaunch,
      progress: client.progress,
      manager: { name: client.managerName, email: client.managerEmail, phone: "+2349030192034" },
      milestones: [
        { id: "1", title: "Project Kickoff", description: "Initial consultation and requirements gathering", status: "completed", date: client.startDate, completedDate: client.startDate },
        { id: "2", title: "Design Phase", description: "Wireframes and design approval", status: client.progress >= 25 ? "completed" : "pending", date: "" },
        { id: "3", title: "Development", description: "Frontend and backend development", status: client.progress >= 50 ? "completed" : client.progress >= 25 ? "in-progress" : "pending", date: "" },
        { id: "4", title: "Content Integration", description: "Adding your content and images", status: client.progress >= 75 ? "completed" : client.progress >= 50 ? "in-progress" : "pending", date: "" },
        { id: "5", title: "Testing & QA", description: "Cross-browser testing and bug fixes", status: client.progress >= 90 ? "completed" : client.progress >= 75 ? "in-progress" : "pending", date: "" },
        { id: "6", title: "Launch", description: "Website goes live!", status: client.progress >= 100 ? "completed" : "pending", date: client.estimatedLaunch },
      ],
      files: [],
      updates: [{ id: "1", message: `Welcome ${client.name}! Your project "${client.projectName}" has been created.`, date: client.startDate, type: "message" }],
    });
    localStorage.setItem("clientProjects", JSON.stringify(clientProjects));

    setNewClient({ status: "planning", progress: 0, startDate: new Date().toISOString().split("T")[0], estimatedLaunch: "", managerName: "Alex Morgan", managerEmail: "alex@ambassadorcre8tive.com" });
    setShowClientForm(false);
    alert("✅ Client created! They can login at /#/client");
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
    { id: "content", label: "Site Content", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
    { id: "services", label: "Services", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
    { id: "projects", label: "Portfolio", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { id: "clients", label: "Client Portal", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
    { id: "leads", label: "Leads", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
    { id: "testimonials", label: "Testimonials", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" },
    { id: "blogs", label: "Blog Posts", icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F3F1]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#5E0B1D] to-[#7A1128] grid place-items-center">
              <span className="text-xl font-bold text-white">A</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
                {firebaseReady
                  ? <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">🔥 Firebase</span>
                  : <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">💾 Local</span>
                }
              </div>
              <p className="text-xs text-gray-500">Ambassador Cre8tive CMS</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => window.open("/", "_blank")} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">View Site</button>
            <button
              onClick={saveAll}
              disabled={saving}
              className={`px-4 py-2 text-sm font-semibold text-white rounded-full transition ${
                saveStatus === "saved" ? "bg-green-600" :
                saveStatus === "error" ? "bg-red-600" :
                "bg-[#5E0B1D] hover:bg-[#4a0917]"
              } disabled:opacity-60`}
            >
              {saving ? "Saving..." : saveStatus === "saved" ? "✅ Saved!" : saveStatus === "error" ? "❌ Error" : "Save All Changes"}
            </button>
            <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600">Logout</button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition ${
                  activeTab === tab.id ? "bg-[#5E0B1D]/10 text-[#5E0B1D]" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                </svg>
                {tab.label}
                {tab.id === "leads" && leads.filter(l => l.status === "new").length > 0 && (
                  <span className="ml-auto bg-[#5E0B1D] text-white text-xs rounded-full px-1.5 py-0.5">{leads.filter(l => l.status === "new").length}</span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">

          {/* Overview */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: "Services", value: services.length, color: "from-blue-500 to-blue-600" },
                  { label: "Projects", value: projects.length, color: "from-[#5E0B1D] to-[#7A1128]" },
                  { label: "Clients", value: clients.length, color: "from-green-500 to-green-600" },
                  { label: "New Leads", value: leads.filter(l => l.status === "new").length, color: "from-orange-500 to-orange-600" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-2xl p-6 border border-gray-200">
                    <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</div>
                    <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[["+ Add Project", "projects"], ["+ Add Client", "clients"], ["View Leads", "leads"], ["Edit Content", "content"]].map(([label, tab]) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className="p-4 rounded-xl bg-[#5E0B1D]/5 text-[#5E0B1D] font-medium hover:bg-[#5E0B1D]/10 text-sm">{label}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Site Content */}
          {activeTab === "content" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">Site Content</h2>
              <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Hero Section</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
                      <input value={siteContent.hero.headline} onChange={(e) => setSiteContent({ ...siteContent, hero: { ...siteContent.hero, headline: e.target.value } })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#5E0B1D]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subheadline</label>
                      <textarea value={siteContent.hero.subheadline} onChange={(e) => setSiteContent({ ...siteContent, hero: { ...siteContent.hero, subheadline: e.target.value } })} rows={3} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#5E0B1D]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Primary CTA</label>
                        <input value={siteContent.hero.ctaPrimary} onChange={(e) => setSiteContent({ ...siteContent, hero: { ...siteContent.hero, ctaPrimary: e.target.value } })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#5E0B1D]" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Secondary CTA</label>
                        <input value={siteContent.hero.ctaSecondary} onChange={(e) => setSiteContent({ ...siteContent, hero: { ...siteContent.hero, ctaSecondary: e.target.value } })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#5E0B1D]" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">About Section</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input value={siteContent.about.title} onChange={(e) => setSiteContent({ ...siteContent, about: { ...siteContent.about, title: e.target.value } })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#5E0B1D]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                      <textarea value={siteContent.about.content} onChange={(e) => setSiteContent({ ...siteContent, about: { ...siteContent.about, content: e.target.value } })} rows={4} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#5E0B1D]" />
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input value={siteContent.contact.email} onChange={(e) => setSiteContent({ ...siteContent, contact: { ...siteContent.contact, email: e.target.value } })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#5E0B1D]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input value={siteContent.contact.phone} onChange={(e) => setSiteContent({ ...siteContent, contact: { ...siteContent.contact, phone: e.target.value } })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#5E0B1D]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Services */}
          {activeTab === "services" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">Services</h2>
                <button onClick={() => fbAddService({ id: Date.now().toString(), title: "New Service", desc: "Service description", icon: "M13 10V3L4 14h7v7l9-11h-7z" })} className="px-4 py-2 bg-[#5E0B1D] text-white rounded-full text-sm font-semibold">+ Add Service</button>
              </div>
              <div className="grid gap-4">
                {services.map((service, index) => (
                  <div key={service.id} className="bg-white rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <input value={service.title} onChange={(e) => { const u = [...services]; u[index] = { ...u[index], title: e.target.value }; setServices(u); }} className="w-full text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 outline-none focus:border-[#5E0B1D]" />
                        <textarea value={service.desc} onChange={(e) => { const u = [...services]; u[index] = { ...u[index], desc: e.target.value }; setServices(u); }} rows={2} className="w-full text-gray-600 outline-none resize-none" />
                      </div>
                      <button onClick={() => removeService(service.id)} className="text-red-500 hover:text-red-700 p-2 flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={ICON.trash} /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">Portfolio Projects</h2>
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Project</h3>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                      <input value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#5E0B1D]" placeholder="e.g., Fashion Brand" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tag/Category</label>
                      <input value={newProject.tag} onChange={(e) => setNewProject({ ...newProject, tag: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#5E0B1D]" placeholder="e.g., E-commerce" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                    <div className="flex gap-2">
                      <input value={newProject.url} onChange={(e) => setNewProject({ ...newProject, url: e.target.value })} className="flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#5E0B1D]" placeholder="https://example.com" />
                      <button onClick={generateMockup} disabled={!newProject.url || generatingMockup} className="px-4 py-3 bg-[#5E0B1D] text-white rounded-xl font-medium hover:bg-[#4a0917] disabled:opacity-50">
                        {generatingMockup ? "Generating..." : "Generate Mockup"}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">URL auto-generates a screenshot preview</p>
                  </div>
                  {newProject.image && (
                    <div className="rounded-xl overflow-hidden border border-gray-200">
                      <img src={newProject.image} alt="Preview" loading="lazy" className="w-full h-48 object-cover" />
                    </div>
                  )}
                  <button onClick={handleAddProject} className="px-6 py-3 bg-[#5E0B1D] text-white rounded-full font-semibold hover:bg-[#4a0917]">Add Project</button>
                </div>
              </div>
              <div className="grid gap-4">
                {projects.map((project) => (
                  <div key={project.id} className="bg-white rounded-2xl p-4 border border-gray-200 flex gap-4">
                    <div className="w-48 h-32 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={project.image} alt={project.title} loading="lazy" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <input value={project.title} onChange={(e) => { const u = [...projects]; u[u.findIndex(p => p.id === project.id)] = { ...project, title: e.target.value }; setProjects(u); }} className="text-lg font-semibold text-gray-900 outline-none border-b border-transparent focus:border-[#5E0B1D] block" />
                          <input value={project.tag} onChange={(e) => { const u = [...projects]; u[u.findIndex(p => p.id === project.id)] = { ...project, tag: e.target.value }; setProjects(u); }} className="text-sm text-gray-500 outline-none border-b border-transparent focus:border-[#5E0B1D] block" />
                        </div>
                        <button onClick={() => removeProject(project.id)} className="text-red-500 hover:text-red-700 p-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={ICON.trash} /></svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">URL:</span>
                        <input value={project.url} onChange={(e) => { const u = [...projects]; u[u.findIndex(p => p.id === project.id)] = { ...project, url: e.target.value }; setProjects(u); }} className="text-sm text-blue-600 underline outline-none flex-1" />
                        <button onClick={() => { setPreviewUrl(project.url); setShowPreview(true); }} className="text-xs px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200">Preview</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clients */}
          {activeTab === "clients" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Client Portal</h2>
                  <p className="text-sm text-gray-500">Manage client access & project progress</p>
                </div>
                <button onClick={() => setShowClientForm(!showClientForm)} className="px-4 py-2 bg-[#5E0B1D] text-white rounded-full text-sm font-semibold">
                  {showClientForm ? "Cancel" : "+ Add Client"}
                </button>
              </div>
              {showClientForm && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">New Client</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {([["Client Name *", "name", "text", "John Doe"], ["Business Name", "business", "text", "Acme Inc"], ["Email *", "email", "email", "client@email.com"], ["Password *", "password", "text", "temppassword"], ["Project Name *", "projectName", "text", "Premium Website"]] as const).map(([label, field, type, ph]) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                        <input type={type} value={(newClient as any)[field] || ""} onChange={(e) => setNewClient({ ...newClient, [field]: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#5E0B1D]" placeholder={ph} />
                      </div>
                    ))}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                      <select value={newClient.projectType || "Business Website"} onChange={(e) => setNewClient({ ...newClient, projectType: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#5E0B1D]">
                        {["Business Website", "E-commerce Store", "Landing Page", "Portfolio Website", "Website Redesign"].map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select value={newClient.status || "planning"} onChange={(e) => setNewClient({ ...newClient, status: e.target.value as Client["status"] })} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#5E0B1D]">
                        {["planning", "design", "development", "review", "launched"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
                      <input type="number" min="0" max="100" value={newClient.progress || 0} onChange={(e) => setNewClient({ ...newClient, progress: parseInt(e.target.value) || 0 })} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#5E0B1D]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input type="date" value={newClient.startDate || ""} onChange={(e) => setNewClient({ ...newClient, startDate: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#5E0B1D]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Est. Launch Date</label>
                      <input type="date" value={newClient.estimatedLaunch || ""} onChange={(e) => setNewClient({ ...newClient, estimatedLaunch: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#5E0B1D]" />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button onClick={handleAddClient} className="px-6 py-2.5 bg-[#5E0B1D] text-white rounded-full text-sm font-semibold">Create Client & Project</button>
                    <button onClick={() => setShowClientForm(false)} className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-full text-sm">Cancel</button>
                  </div>
                </div>
              )}
              <div className="grid gap-4">
                {clients.length === 0 && (
                  <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
                    <p className="text-gray-500 mb-4">No clients yet. Add your first client to give them portal access.</p>
                    <button onClick={() => setShowClientForm(true)} className="px-4 py-2 bg-[#5E0B1D]/10 text-[#5E0B1D] rounded-full text-sm font-medium">+ Add First Client</button>
                  </div>
                )}
                {clients.map((client) => (
                  <div key={client.id} className="bg-white rounded-2xl p-6 border border-gray-200">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${client.status === "launched" ? "bg-green-100 text-green-700" : client.status === "development" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>{client.status}</span>
                        </div>
                        <p className="text-sm text-gray-600">{client.business}</p>
                        <p className="text-sm text-gray-500">{client.email}</p>
                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">{client.projectName}</span>
                            <span className="font-medium text-[#5E0B1D]">{client.progress}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#5E0B1D] to-[#8B1538] rounded-full transition-all" style={{ width: `${client.progress}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="text-right text-xs text-gray-400">
                          <p>Login: {client.email}</p>
                          {(client as any).password && <p>Pass: {(client as any).password}</p>}
                        </div>
                        <div className="flex gap-2">
                          <a href="#/client" target="_blank" className="px-3 py-1.5 bg-[#5E0B1D]/10 text-[#5E0B1D] rounded-lg text-xs font-medium">View Portal</a>
                          <button onClick={() => removeClient(client.id)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium">Delete</button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <label className="text-xs font-medium text-gray-600">Quick Progress Update:</label>
                      <input type="range" min="0" max="100" value={client.progress} onChange={(e) => updateProgress(client.id, parseInt(e.target.value))} className="w-full mt-2 accent-[#5E0B1D]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leads */}
          {activeTab === "leads" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Leads</h2>
                  <p className="text-sm text-gray-500">{leads.filter(l => l.status === "new").length} new leads from contact form</p>
                </div>
                <div className="flex items-center gap-2">
                  {firebaseReady ? <span className="text-xs text-green-600 font-medium">🔥 Live from Firebase</span> : <span className="text-xs text-yellow-600">No Firebase — leads not saved</span>}
                </div>
              </div>
              {leads.length === 0 && (
                <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
                  <p className="text-gray-500">No leads yet. Contact form submissions will appear here once Firebase is connected.</p>
                </div>
              )}
              <div className="grid gap-4">
                {leads.map((lead) => (
                  <div key={lead.id} className="bg-white rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            lead.status === "new" ? "bg-blue-100 text-blue-700" :
                            lead.status === "contacted" ? "bg-yellow-100 text-yellow-700" :
                            lead.status === "converted" ? "bg-green-100 text-green-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>{lead.status}</span>
                        </div>
                        {lead.business && <p className="text-sm text-gray-600">{lead.business}</p>}
                        <p className="text-sm text-gray-500">{lead.email} {lead.phone && `• ${lead.phone}`}</p>
                        <p className="text-sm text-gray-700 mt-2">{lead.message}</p>
                        {lead.createdAt && <p className="text-xs text-gray-400 mt-1">{lead.createdAt.toDate?.()?.toLocaleDateString()}</p>}
                      </div>
                      <div className="flex flex-col gap-2">
                        <a href={`https://wa.me/${lead.phone?.replace(/\D/g, "")}`} target="_blank" className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium">WhatsApp</a>
                        <a href={`mailto:${lead.email}`} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">Email</a>
                        <select value={lead.status} onChange={(e) => updateLeadStatus(lead.id, e.target.value as any)} className="text-xs border rounded-lg px-2 py-1 outline-none">
                          {["new", "contacted", "qualified", "converted", "lost"].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Testimonials */}
          {activeTab === "testimonials" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">Testimonials</h2>
                <button onClick={() => fbAddTestimonial({ id: Date.now().toString(), name: "Client Name", role: "Role, Company", quote: "Their review here.", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200", rating: 5, featured: true, order: testimonials.length + 1 })} className="px-4 py-2 bg-[#5E0B1D] text-white rounded-full text-sm font-semibold">+ Add Testimonial</button>
              </div>
              <div className="grid gap-4">
                {testimonials.map((t, index) => (
                  <div key={t.id} className="bg-white rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-start gap-4">
                      <img src={t.img} alt={t.name} loading="lazy" className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <input value={t.name} onChange={(e) => { const u = [...testimonials]; u[index] = { ...u[index], name: e.target.value }; setTestimonials(u); }} className="font-semibold text-gray-900 border-b border-gray-200 outline-none focus:border-[#5E0B1D]" />
                          <input value={t.role} onChange={(e) => { const u = [...testimonials]; u[index] = { ...u[index], role: e.target.value }; setTestimonials(u); }} className="text-gray-500 border-b border-gray-200 outline-none focus:border-[#5E0B1D]" />
                        </div>
                        <textarea value={t.quote} onChange={(e) => { const u = [...testimonials]; u[index] = { ...u[index], quote: e.target.value }; setTestimonials(u); }} rows={3} className="w-full text-gray-600 outline-none resize-none" />
                        <input type="text" placeholder="Photo URL" value={t.img} onChange={(e) => { const u = [...testimonials]; u[index] = { ...u[index], img: e.target.value }; setTestimonials(u); }} className="w-full text-xs text-gray-400 border rounded-lg px-2 py-1 outline-none focus:border-[#5E0B1D]" />
                      </div>
                      <button onClick={() => removeTestimonial(t.id)} className="text-red-500 hover:text-red-700 p-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={ICON.trash} /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Blog Posts */}
          {activeTab === "blogs" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">Blog Posts</h2>
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <button className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#5E0B1D] hover:text-[#5E0B1D] font-medium">
                  + Create New Blog Post
                </button>
              </div>
              <div className="grid gap-4">
                {blogs.map((blog, index) => (
                  <div key={blog.id} className="bg-white rounded-2xl p-6 border border-gray-200 flex gap-4">
                    <div className="w-48 h-32 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={blog.image} alt={blog.title} loading="lazy" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <input value={blog.title} onChange={(e) => { const u = [...blogs]; u[index].title = e.target.value; setBlogs(u); }} className="text-lg font-semibold text-gray-900 outline-none flex-1" />
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${blog.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>{blog.published ? "Published" : "Draft"}</span>
                      </div>
                      <textarea value={blog.excerpt} onChange={(e) => { const u = [...blogs]; u[index].excerpt = e.target.value; setBlogs(u); }} rows={2} className="w-full text-gray-600 outline-none resize-none" />
                      <div className="flex items-center gap-4">
                        <input type="date" value={blog.date} onChange={(e) => { const u = [...blogs]; u[index].date = e.target.value; setBlogs(u); }} className="text-sm border rounded-lg px-2 py-1" />
                        <button onClick={() => { const u = [...blogs]; u[index].published = !u[index].published; setBlogs(u); }} className={`text-xs px-3 py-1 rounded-full ${blog.published ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                          {blog.published ? "Unpublish" : "Publish"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Live Preview (Scroll only)</h3>
              <button onClick={() => setShowPreview(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={ICON.close} /></svg>
              </button>
            </div>
            <div className="h-full overflow-y-auto relative">
              <div className="absolute inset-0 z-10 cursor-ns-resize" />
              <iframe src={previewUrl} className="w-full h-[5000px] border-none" title="Preview" sandbox="allow-same-origin allow-scripts" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
