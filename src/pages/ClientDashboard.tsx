import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Milestone {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "pending";
  date?: string;
  completedDate?: string;
}

interface ProjectFile {
  id: string;
  name: string;
  type: "pdf" | "image" | "link" | "doc";
  url: string;
  uploadedAt: string;
}

interface ProjectUpdate {
  id: string;
  message: string;
  date: string;
  type: "milestone" | "message" | "file";
}

interface ClientProject {
  id: string;
  name: string;
  businessName: string;
  type: string;
  status: "planning" | "design" | "development" | "review" | "launched";
  startDate: string;
  estimatedLaunch: string;
  progress: number;
  milestones: Milestone[];
  files: ProjectFile[];
  updates: ProjectUpdate[];
  manager: {
    name: string;
    email: string;
    phone: string;
  };
}

export default function ClientDashboard() {
  const [clientData, setClientData] = useState<any>(null);
  const [project, setProject] = useState<ClientProject | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = JSON.parse(localStorage.getItem("clientData") || "{}");
    setClientData(client);

    // Load project data from admin-created projects
    const projects = JSON.parse(localStorage.getItem("clientProjects") || "[]");
    const clientProject = projects.find((p: any) => p.clientId === client.id);
    
    if (clientProject) {
      setProject(clientProject);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("clientLoggedIn");
    localStorage.removeItem("clientData");
    window.location.hash = "#/";
    window.location.reload();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planning: "bg-yellow-500",
      design: "bg-purple-500",
      development: "bg-blue-500",
      review: "bg-orange-500",
      launched: "bg-green-500",
      completed: "bg-green-500",
      "in-progress": "bg-blue-500",
      pending: "bg-gray-400",
    };
    return colors[status] || "bg-gray-400";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      planning: "Planning",
      design: "Design Phase",
      development: "In Development",
      review: "Under Review",
      launched: "Live",
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F3F1] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#5E0B1D] to-[#7A1128] animate-pulse" />
          <p className="text-[#5E0B1D]/60">Loading your project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#F5F3F1] flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Active Project</h2>
          <p className="text-gray-600 mb-4">You don't have any active projects at the moment.</p>
          <button onClick={handleLogout} className="text-[#5E0B1D] font-medium hover:underline">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3F1]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#5E0B1D]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#5E0B1D] to-[#7A1128] grid place-items-center">
                <span className="text-xl font-bold text-white">A</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Client Portal</div>
                <div className="text-xs text-[#5E0B1D]/70">Ambassador Cre8tive</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-gray-900">{clientData?.name}</div>
                <div className="text-xs text-gray-500">{clientData?.business}</div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#5E0B1D] transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-[#5E0B1D]/10 p-6 mb-8 premium-shadow"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(project.status)}`}>
                  {getStatusLabel(project.status)}
                </span>
              </div>
              <p className="text-gray-600">{project.businessName}</p>
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Started {new Date(project.startDate).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Est. Launch {new Date(project.estimatedLaunch).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#5E0B1D]">{project.progress}%</div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${project.progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[#5E0B1D] to-[#8B1538] rounded-full"
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Planning</span>
              <span>Design</span>
              <span>Development</span>
              <span>Review</span>
              <span>Launch</span>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: "overview", label: "Overview", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
            { id: "milestones", label: "Milestones", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
            { id: "files", label: "Files", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
            { id: "team", label: "Your Team", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[#5E0B1D] text-white shadow-lg shadow-[#5E0B1D]/20"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d={tab.icon} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid gap-6 lg:grid-cols-3"
            >
              {/* Recent Updates */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border border-[#5E0B1D]/10 p-6 premium-shadow">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Updates</h2>
                  <div className="space-y-4">
                    {project.updates.map((update, i) => (
                      <motion.div
                        key={update.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex gap-4 p-4 rounded-xl bg-gray-50"
                      >
                        <div className={`h-10 w-10 rounded-full grid place-items-center flex-shrink-0 ${
                          update.type === "milestone" ? "bg-green-100 text-green-600" :
                          update.type === "file" ? "bg-blue-100 text-blue-600" :
                          "bg-[#5E0B1D]/10 text-[#5E0B1D]"
                        }`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            {update.type === "milestone" ? <path d="M5 13l4 4L19 7" /> :
                             update.type === "file" ? <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> :
                             <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />}
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800">{update.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(update.date).toLocaleDateString()}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Milestones", value: `${project.milestones.filter(m => m.status === "completed").length}/${project.milestones.length}`, color: "text-green-600" },
                    { label: "Days Remaining", value: Math.max(0, Math.ceil((new Date(project.estimatedLaunch).getTime() - Date.now()) / (1000 * 60 * 60 * 24))), color: "text-[#5E0B1D]" },
                    { label: "Files Shared", value: project.files.length, color: "text-blue-600" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl border border-[#5E0B1D]/10 p-4 text-center">
                      <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Manager */}
              <div className="bg-white rounded-2xl border border-[#5E0B1D]/10 p-6 premium-shadow h-fit">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Project Manager</h2>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#5E0B1D] to-[#8B1538] grid place-items-center text-white text-xl font-bold">
                    {project.manager.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{project.manager.name}</div>
                    <div className="text-sm text-gray-500">Project Manager</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <a href={`mailto:${project.manager.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#5E0B1D] transition p-2 rounded-lg hover:bg-gray-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    {project.manager.email}
                  </a>
                  <a href={`https://wa.me/${project.manager.phone.replace(/\D/g, "")}`} target="_blank" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#25D366] transition p-2 rounded-lg hover:bg-gray-50">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.52 3.48A11.86 11.86 0 0012.02 0 11.93 11.93 0 001.5 17.94L0 24l6.2-1.62a11.93 11.93 0 005.82 1.48h.01A11.93 11.93 0 0020.52 3.48z" /></svg>
                    WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "milestones" && (
            <motion.div
              key="milestones"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-2xl border border-[#5E0B1D]/10 p-6 premium-shadow"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Project Milestones</h2>
              <div className="space-y-0">
                {project.milestones.map((milestone, i) => (
                  <motion.div
                    key={milestone.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative flex gap-4 pb-8 last:pb-0"
                  >
                    {/* Timeline line */}
                    {i < project.milestones.length - 1 && (
                      <div className="absolute left-5 top-10 bottom-0 w-px bg-gray-200" />
                    )}
                    
                    {/* Status indicator */}
                    <div className={`relative z-10 h-10 w-10 rounded-full grid place-items-center flex-shrink-0 ${
                      milestone.status === "completed" ? "bg-green-500 text-white" :
                      milestone.status === "in-progress" ? "bg-blue-500 text-white" :
                      "bg-gray-200 text-gray-400"
                    }`}>
                      {milestone.status === "completed" ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                      ) : milestone.status === "in-progress" ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-gray-400" />
                      )}
                    </div>

                    <div className="flex-1 pt-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${milestone.status === "completed" ? "text-gray-900" : milestone.status === "in-progress" ? "text-[#5E0B1D]" : "text-gray-500"}`}>
                          {milestone.title}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          milestone.status === "completed" ? "bg-green-100 text-green-700" :
                          milestone.status === "in-progress" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-500"
                        }`}>
                          {milestone.status === "completed" ? "Completed" : milestone.status === "in-progress" ? "In Progress" : "Pending"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{milestone.description}</p>
                      <p className="text-xs text-gray-400">
                        {milestone.completedDate ? `Completed ${new Date(milestone.completedDate).toLocaleDateString()}` : 
                         milestone.date ? `Due ${new Date(milestone.date).toLocaleDateString()}` : "Scheduled"}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "files" && (
            <motion.div
              key="files"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-2xl border border-[#5E0B1D]/10 p-6 premium-shadow"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Files</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {project.files.map((file, i) => (
                  <motion.a
                    key={file.id}
                    href={file.url}
                    target="_blank"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -2, boxShadow: "0 8px 24px -8px rgba(94,11,29,0.15)" }}
                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-[#5E0B1D]/30 transition group"
                  >
                    <div className={`h-10 w-10 rounded-lg grid place-items-center ${
                      file.type === "pdf" ? "bg-red-100 text-red-600" :
                      file.type === "image" ? "bg-purple-100 text-purple-600" :
                      file.type === "link" ? "bg-blue-100 text-blue-600" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        {file.type === "pdf" ? <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /> :
                         file.type === "link" ? <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /> :
                         <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate group-hover:text-[#5E0B1D] transition">{file.name}</p>
                      <p className="text-xs text-gray-500">Added {new Date(file.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </motion.a>
                ))}
              </div>
              {project.files.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No files shared yet. Your project manager will add documents here.
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "team" && (
            <motion.div
              key="team"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid gap-6 md:grid-cols-2"
            >
              {/* Project Manager Card */}
              <div className="bg-white rounded-2xl border border-[#5E0B1D]/10 p-6 premium-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#5E0B1D] to-[#8B1538] grid place-items-center text-white text-2xl font-bold">
                    {project.manager.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{project.manager.name}</h3>
                    <p className="text-sm text-gray-500">Project Manager</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Your dedicated project manager will guide you through every step of the process. Reach out anytime with questions or feedback.
                </p>
                <div className="space-y-2">
                  <a href={`mailto:${project.manager.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#5E0B1D] transition p-2 rounded-lg hover:bg-gray-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    {project.manager.email}
                  </a>
                  <a href={`https://wa.me/${project.manager.phone.replace(/\D/g, "")}`} target="_blank" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#25D366] transition p-2 rounded-lg hover:bg-gray-50">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.52 3.48A11.86 11.86 0 0012.02 0 11.93 11.93 0 001.5 17.94L0 24l6.2-1.62a11.93 11.93 0 005.82 1.48h.01A11.93 11.93 0 0020.52 3.48z" /></svg>
                    WhatsApp Direct
                  </a>
                </div>
              </div>

              {/* Agency Info */}
              <div className="bg-gradient-to-br from-[#5E0B1D] to-[#7A1128] rounded-2xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Ambassador Cre8tive</h3>
                <p className="text-white/80 text-sm mb-4">Premium Web Design & Development Agency</p>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2 text-white/70">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Ibadan, Nigeria
                  </p>
                  <p className="flex items-center gap-2 text-white/70">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    +234 903 019 2034
                  </p>
                  <p className="flex items-center gap-2 text-white/70">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    ambassadorcre8tive@gmail.com
                  </p>
                </div>
                <a href="#/" target="_blank" className="inline-flex items-center gap-2 mt-6 text-sm font-medium bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition">
                  Visit Main Website
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
