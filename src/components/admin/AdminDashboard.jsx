import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { apiEndpoint } from "../../config.js";

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState({ profile: {}, projects: [], skills: [], education: [] });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // Form states for creating/editing projects
  const [projectForm, setProjectForm] = useState({ title: "", kind: "Personal Project", description: "", technologies: "", github: "", demo: "", image: "" });
  const [editingProjectId, setEditingProjectId] = useState(null);

  // Skill form
  const [skillForm, setSkillForm] = useState({ group_name: "Frontend", item_name: "" });

  // Education form
  const [eduForm, setEduForm] = useState({ period: "", title: "", institution: "", location: "", description: "", topics: "" });

  // Profile form
  const [profileForm, setProfileForm] = useState({ name: "", title: "", secondary: "", school: "", location: "", tagline: "", sidebar_description: "", email: "", github: "", linkedin: "", form_endpoint: "", image: "" });

  // Security form
  const [securityForm, setSecurityForm] = useState({ currentPassword: "", newUsername: "mucyo answer", newPassword: "" });

  const fetchData = async () => {
    try {
      const res = await fetch(apiEndpoint("/api/portfolio"));
      const json = await res.json();
      setData(json);
      if (json.profile) {
        setProfileForm(json.profile);
        if (json.profile.username) {
          setSecurityForm((prev) => ({ ...prev, newUsername: json.profile.username }));
        }
      }
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(apiEndpoint("/api/auth/logout"), { method: "POST", credentials: "include" });
      onLogout();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  // --- Project handlers ---
  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const url = editingProjectId ? apiEndpoint(`/api/admin/projects/${editingProjectId}`) : apiEndpoint("/api/admin/projects");
      const method = editingProjectId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(projectForm),
      });

      if (!res.ok) throw new Error("Failed to save project");
      setMsg(editingProjectId ? "Project updated successfully!" : "Project created successfully!");
      setProjectForm({ title: "", kind: "Personal Project", description: "", technologies: "", github: "", demo: "", image: "" });
      setEditingProjectId(null);
      fetchData();
    } catch (err) {
      setMsg(err.message);
    }
  };

  const handleEditProject = (p) => {
    setEditingProjectId(p.id);
    setProjectForm({
      title: p.title,
      kind: p.kind,
      description: p.description,
      technologies: Array.isArray(p.technologies) ? p.technologies.join(", ") : p.technologies,
      github: p.github || "",
      demo: p.demo || "",
      image: p.image || "",
    });
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await fetch(apiEndpoint(`/api/admin/projects/${id}`), { method: "DELETE", credentials: "include" });
      setMsg("Project deleted.");
      fetchData();
    } catch (err) {
      setMsg("Failed to delete project");
    }
  };

  // --- Skill handlers ---
  const handleSkillSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(apiEndpoint("/api/admin/skills"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(skillForm),
      });
      setSkillForm({ group_name: "Frontend", item_name: "" });
      setMsg("Skill added successfully!");
      fetchData();
    } catch (err) {
      setMsg("Failed to add skill");
    }
  };

  const handleDeleteSkill = async (id) => {
    if (!window.confirm("Delete skill?")) return;
    try {
      await fetch(apiEndpoint(`/api/admin/skills/${id}`), { method: "DELETE", credentials: "include" });
      setMsg("Skill deleted.");
      fetchData();
    } catch (err) {
      setMsg("Failed to delete skill");
    }
  };

  // --- Education handlers ---
  const handleEduSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(apiEndpoint("/api/admin/education"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(eduForm),
      });
      setEduForm({ period: "", title: "", institution: "", location: "", description: "", topics: "" });
      setMsg("Education record added!");
      fetchData();
    } catch (err) {
      setMsg("Failed to add education");
    }
  };

  const handleDeleteEdu = async (id) => {
    if (!window.confirm("Delete education record?")) return;
    try {
      await fetch(apiEndpoint(`/api/admin/education/${id}`), { method: "DELETE", credentials: "include" });
      setMsg("Education deleted.");
      fetchData();
    } catch (err) {
      setMsg("Failed to delete education");
    }
  };

  // --- Profile handlers ---
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(apiEndpoint("/api/admin/profile"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(profileForm),
      });
      if (!res.ok) throw new Error("Failed");
      setMsg("Profile updated successfully!");
      fetchData();
    } catch (err) {
      setMsg("Failed to update profile");
    }
  };

  // --- Security handlers ---
  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await fetch(apiEndpoint("/api/admin/credentials"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(securityForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update credentials");
      setMsg("Admin credentials updated successfully!");
      setSecurityForm({ currentPassword: "", newUsername: securityForm.newUsername, newPassword: "" });
    } catch (err) {
      setMsg(err.message);
    }
  };

  if (loading) {
    return <div style={{ padding: "80px", textAlign: "center", color: "var(--text)" }}>Loading Admin Dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-container">
          <h1>⚡ Admin Dashboard</h1>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <a href="/" className="btn" style={{ padding: "8px 16px", margin: 0, fontSize: "0.85rem" }} target="_blank" rel="noreferrer">
              View Public Site ↗
            </a>
            <button onClick={handleLogout} className="btn" style={{ padding: "8px 16px", margin: 0, fontSize: "0.85rem", color: "#ff6b6b", borderColor: "#ff6b6b" }}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>
            📊 Overview
          </button>
          <button className={activeTab === "projects" ? "active" : ""} onClick={() => setActiveTab("projects")}>
            🚀 Projects ({data.projects.length})
          </button>
          <button className={activeTab === "skills" ? "active" : ""} onClick={() => setActiveTab("skills")}>
            ⚡ Skills ({data.skills.length})
          </button>
          <button className={activeTab === "education" ? "active" : ""} onClick={() => setActiveTab("education")}>
            🎓 Education ({data.education.length})
          </button>
          <button className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}>
            👤 Profile & Settings
          </button>
          <button className={activeTab === "security" ? "active" : ""} onClick={() => setActiveTab("security")}>
            🔒 Admin Security
          </button>
        </aside>

        <main className="admin-content">
          {msg && <div className="form-status ok" style={{ marginBottom: "20px" }}>{msg}</div>}

          {activeTab === "overview" && (
            <div>
              <h2 className="section-title">Dashboard Statistics</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Projects</h3>
                  <p className="stat-number">{data.projects.length}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Skills</h3>
                  <p className="stat-number">{data.skills.length}</p>
                </div>
                <div className="stat-card">
                  <h3>Education Records</h3>
                  <p className="stat-number">{data.education.length}</p>
                </div>
                <div className="stat-card">
                  <h3>Admin Status</h3>
                  <p className="stat-number" style={{ fontSize: "1.2rem", color: "var(--accent)" }}>Securely Active</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "projects" && (
            <div>
              <h2 className="section-title">{editingProjectId ? "Edit Project" : "Add New Project"}</h2>
              <form onSubmit={handleProjectSubmit} className="form" style={{ marginBottom: "40px" }}>
                <label>Title</label>
                <input type="text" value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} required />

                <label>Kind</label>
                <input type="text" value={projectForm.kind} onChange={(e) => setProjectForm({ ...projectForm, kind: e.target.value })} required />

                <label>Description</label>
                <textarea rows="3" value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} required />

                <label>Technologies (comma separated)</label>
                <input type="text" value={projectForm.technologies} onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value })} placeholder="React.js, Node.js, MySQL" required />

                <label>GitHub URL</label>
                <input type="url" value={projectForm.github} onChange={(e) => setProjectForm({ ...projectForm, github: e.target.value })} />

                <label>Demo URL</label>
                <input type="url" value={projectForm.demo} onChange={(e) => setProjectForm({ ...projectForm, demo: e.target.value })} />

                <label>Image URL</label>
                <input type="text" value={projectForm.image} onChange={(e) => setProjectForm({ ...projectForm, image: e.target.value })} />

                <div style={{ display: "flex", gap: "12px" }}>
                  <button type="submit" className="btn">{editingProjectId ? "Update Project" : "Add Project"}</button>
                  {editingProjectId && (
                    <button type="button" className="btn" style={{ borderColor: "var(--text-muted)", color: "var(--text-muted)" }} onClick={() => { setEditingProjectId(null); setProjectForm({ title: "", kind: "Personal Project", description: "", technologies: "", github: "", demo: "", image: "" }); }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <h2 className="section-title">Manage Existing Projects</h2>
              <div className="admin-list">
                {data.projects.map((p) => (
                  <div key={p.id} className="admin-item-card">
                    <div>
                      <strong>{p.title}</strong> <span className="muted">({p.kind})</span>
                      <p className="muted" style={{ fontSize: "0.9rem", margin: "4px 0" }}>{p.description}</p>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button className="btn" style={{ padding: "6px 12px", fontSize: "0.8rem" }} onClick={() => handleEditProject(p)}>Edit</button>
                      <button className="btn" style={{ padding: "6px 12px", fontSize: "0.8rem", color: "#ff6b6b", borderColor: "#ff6b6b" }} onClick={() => handleDeleteProject(p.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "skills" && (
            <div>
              <h2 className="section-title">Add New Skill</h2>
              <form onSubmit={handleSkillSubmit} className="form" style={{ marginBottom: "40px" }}>
                <label>Category Group</label>
                <select value={skillForm.group_name} onChange={(e) => setSkillForm({ ...skillForm, group_name: e.target.value })} style={{ padding: "12px", background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Database">Database</option>
                  <option value="Tools">Tools</option>
                  <option value="IoT">IoT</option>
                  <option value="Creative">Creative</option>
                </select>

                <label>Skill Name</label>
                <input type="text" value={skillForm.item_name} onChange={(e) => setSkillForm({ ...skillForm, item_name: e.target.value })} placeholder="e.g. TypeScript" required />

                <button type="submit" className="btn">Add Skill</button>
              </form>

              <h2 className="section-title">Manage Skills</h2>
              <div className="admin-list">
                {data.skills.map((s) => (
                  <div key={s.id} className="admin-item-card">
                    <div>
                      <strong>{s.item_name}</strong> <span className="muted">[{s.group_name}]</span>
                    </div>
                    <button className="btn" style={{ padding: "6px 12px", fontSize: "0.8rem", color: "#ff6b6b", borderColor: "#ff6b6b" }} onClick={() => handleDeleteSkill(s.id)}>Delete</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "education" && (
            <div>
              <h2 className="section-title">Add Education Record</h2>
              <form onSubmit={handleEduSubmit} className="form" style={{ marginBottom: "40px" }}>
                <label>Period</label>
                <input type="text" value={eduForm.period} onChange={(e) => setEduForm({ ...eduForm, period: e.target.value })} placeholder="e.g. 2024 - Present" required />

                <label>Title / Program</label>
                <input type="text" value={eduForm.title} onChange={(e) => setEduForm({ ...eduForm, title: e.target.value })} placeholder="Software Development Student" required />

                <label>Institution</label>
                <input type="text" value={eduForm.institution} onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })} placeholder="Lycée de Muhura" required />

                <label>Location</label>
                <input type="text" value={eduForm.location} onChange={(e) => setEduForm({ ...eduForm, location: e.target.value })} placeholder="Rwanda" required />

                <label>Description</label>
                <textarea rows="3" value={eduForm.description} onChange={(e) => setEduForm({ ...eduForm, description: e.target.value })} required />

                <label>Topics (comma separated)</label>
                <input type="text" value={eduForm.topics} onChange={(e) => setEduForm({ ...eduForm, topics: e.target.value })} placeholder="Programming, Web Development" required />

                <button type="submit" className="btn">Add Education</button>
              </form>

              <h2 className="section-title">Manage Education</h2>
              <div className="admin-list">
                {data.education.map((e) => (
                  <div key={e.id} className="admin-item-card">
                    <div>
                      <strong>{e.title}</strong> at {e.institution} <span className="muted">({e.period})</span>
                    </div>
                    <button className="btn" style={{ padding: "6px 12px", fontSize: "0.8rem", color: "#ff6b6b", borderColor: "#ff6b6b" }} onClick={() => handleDeleteEdu(e.id)}>Delete</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div>
              <h2 className="section-title">Profile & Settings</h2>
              <form onSubmit={handleProfileSubmit} className="form">
                <label>Name</label>
                <input type="text" value={profileForm.name || ""} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} required />

                <label>Profile Image URL / Path</label>
                <input type="text" value={profileForm.image || ""} onChange={(e) => setProfileForm({ ...profileForm, image: e.target.value })} placeholder="/mucyo.JPG" />

                <label>Title</label>
                <input type="text" value={profileForm.title || ""} onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })} required />

                <label>Secondary Role</label>
                <input type="text" value={profileForm.secondary || ""} onChange={(e) => setProfileForm({ ...profileForm, secondary: e.target.value })} required />

                <label>School</label>
                <input type="text" value={profileForm.school || ""} onChange={(e) => setProfileForm({ ...profileForm, school: e.target.value })} required />

                <label>Location</label>
                <input type="text" value={profileForm.location || ""} onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })} required />

                <label>Tagline</label>
                <input type="text" value={profileForm.tagline || ""} onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })} required />

                <label>Sidebar Description</label>
                <textarea rows="3" value={profileForm.sidebar_description || ""} onChange={(e) => setProfileForm({ ...profileForm, sidebar_description: e.target.value })} required />

                <label>Email</label>
                <input type="email" value={profileForm.email || ""} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} required />

                <label>GitHub URL</label>
                <input type="url" value={profileForm.github || ""} onChange={(e) => setProfileForm({ ...profileForm, github: e.target.value })} />

                <label>LinkedIn URL</label>
                <input type="url" value={profileForm.linkedin || ""} onChange={(e) => setProfileForm({ ...profileForm, linkedin: e.target.value })} />

                <button type="submit" className="btn">Save Profile Changes</button>
              </form>
            </div>
          )}

          {activeTab === "security" && (
            <div>
              <h2 className="section-title">Change Admin Username & Password</h2>
              <form onSubmit={handleSecuritySubmit} className="form">
                <label>Current Password (required)</label>
                <input type="password" value={securityForm.currentPassword} onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })} placeholder="Enter current admin password" required />

                <label>New Username</label>
                <input type="text" value={securityForm.newUsername} onChange={(e) => setSecurityForm({ ...securityForm, newUsername: e.target.value })} placeholder="Enter new username" required />

                <label>New Password (leave blank to keep current password)</label>
                <input type="password" value={securityForm.newPassword} onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })} placeholder="Enter new password (optional)" />

                <button type="submit" className="btn">Update Credentials</button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
