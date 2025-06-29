import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { account, databases, ID } from "@/appwrite/client"
import { Button } from "@/components/ui/button"
import { Plus, LogOut, Trash2 } from "lucide-react"
import { APPWRITE } from "@/config";

const DATABASE_ID = "685121b70037b398f4a7"
const COLLECTION_ID = "6851221a003005960079"

async function fetchProjects() {
  const res = await databases.listDocuments(DATABASE_ID, COLLECTION_ID)
  return res.documents
}

async function createProject(name) {
  return await databases.createDocument(
    DATABASE_ID,
    COLLECTION_ID,
    ID.unique(),
    { name }
  )
}

async function deleteProject(projectId) {
  await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, projectId)
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    fetchProjects()
      .then(setProjects)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await account.deleteSession("current")
      navigate("/login")
    } catch (err) {
      alert("Sign out failed: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    if (!newProjectName.trim()) return
    setCreating(true)
    try {
      const project = await createProject(newProjectName.trim())
      setProjects(prev => [...prev, project])
      setNewProjectName("")
      navigate(`/project/${project.$id}`)
    } catch (err) {
      setError(err)
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return
    setDeletingId(projectId)
    try {
      await deleteProject(projectId)
      setProjects(prev => prev.filter(p => p.$id !== projectId))
    } catch (err) {
      alert("Failed to delete project: " + err.message)
    } finally {
      setDeletingId(null)
    }
  }

  // Empty state: No projects
  if (!loading && projects.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pastel-pink/40 via-white to-blue-100 font-sans">
        <div className="w-full max-w-md mx-auto bg-white/90 rounded-3xl shadow-2xl p-10 flex flex-col items-center gap-8 border border-white/40 backdrop-blur-md animate-fade-in">
          <img src="/logo.png" alt="Aitheria Logo" className="h-14 w-14 mb-2 animate-logo-pop" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight animate-slide-down">
            Welcome to <span className="text-pastel-pink">Aitheria</span>
          </h2>
          <p className="mb-2 text-gray-700 text-center text-lg animate-fade-in-delayed">
            Start your research journey by creating your first project.
          </p>
          <form
            onSubmit={handleCreateProject}
            className="w-full flex flex-col gap-5 items-center"
            autoComplete="off"
          >
            <input
              className="border-2 border-pastel-pink/60 focus:border-pastel-pink focus:ring-2 focus:ring-pastel-pink/40 rounded-xl px-5 py-3 text-lg transition-all duration-300 outline-none shadow-sm bg-white/80 animate-input-pop"
              placeholder="Project Name"
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              required
              disabled={creating}
              style={{ transition: "box-shadow 0.3s, border-color 0.3s" }}
            />
            <button
              type="submit"
              disabled={creating}
              className="group w-full py-3 rounded-xl font-semibold text-lg border border-black text-black bg-transparent hover:bg-gray-50 transition-all duration-200 outline-none shadow-sm focus:ring-2 focus:ring-black/20 cursor-pointer"
              style={{ cursor: "pointer" }}
            >
              <span className="flex items-center justify-center gap-2">
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                {creating ? "Creating..." : "Create Project"}
              </span>
            </button>
          </form>
          {error && <div className="text-red-500 text-sm">{error.message}</div>}
        </div>
        <style>{`
          .animate-fade-in {
            animation: fadeInUp 0.7s cubic-bezier(.4,0,.2,1) both;
          }
          .animate-fade-in-delayed {
            animation: fadeInUp 1.2s cubic-bezier(.4,0,.2,1) both;
          }
          .animate-slide-down {
            animation: slideDown 0.8s cubic-bezier(.4,0,.2,1) both;
          }
          .animate-logo-pop {
            animation: logoPop 0.7s cubic-bezier(.4,0,.2,1) both;
          }
          .animate-input-pop {
            animation: inputPop 0.9s cubic-bezier(.4,0,.2,1) both;
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px) scale(0.98);}
            to { opacity: 1; transform: none;}
          }
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-30px);}
            to { opacity: 1; transform: none;}
          }
          @keyframes logoPop {
            0% { opacity: 0; transform: scale(0.7);}
            70% { opacity: 1; transform: scale(1.1);}
            100% { opacity: 1; transform: scale(1);}
          }
          @keyframes inputPop {
            0% { opacity: 0; transform: scale(0.9);}
            100% { opacity: 1; transform: scale(1);}
          }
        `}</style>
      </div>
    )
  }

  // Main dashboard with sidebar and project list
  return (
    <div
      className="min-h-screen flex bg-gradient-to-br from-pastel-pink/40 via-white to-blue-100 font-sans"
      style={{
        fontFamily: 'SF Pro Display, SF Pro Icons, Helvetica Neue, Helvetica, Arial, sans-serif',
      }}
    >
      {/* Left Panel: Projects List */}
      <aside className="w-full max-w-xs bg-white/80 border-r border-gray-200 flex flex-col justify-between py-8 px-6 min-h-screen shadow-lg">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <img src="/logo.png" alt="Aitheria Logo" className="h-10 w-10" />
            <span className="text-2xl font-bold tracking-tight text-gray-900">
              A<span className="text-pastel-pink">i</span>theria
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {loading ? (
              <div className="text-gray-400 text-center py-8">Loading...</div>
            ) : projects.length === 0 ? (
              <div className="text-gray-400 text-center py-8 italic">
                No projects yet.
              </div>
            ) : (
              projects.map((p) => (
                <div
                  key={p.$id}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-medium transition-all hover:bg-black hover:text-white hover:scale-[1.03] cursor-pointer select-none project-list-item group"
                  onClick={() => navigate(`/project/${p.$id}`)}
                  tabIndex={0}
                  style={{ transition: "background 0.2s, color 0.2s, transform 0.2s" }}
                >
                  <span className="text-xl">📓</span>
                  <span className="truncate flex-1">{p.name}</span>
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-1 rounded-full hover:bg-red-100 hover:text-red-600"
                    onClick={e => {
                      e.stopPropagation()
                      handleDeleteProject(p.$id)
                    }}
                    title="Delete project"
                    style={{ cursor: "pointer" }}
                    disabled={deletingId === p.$id}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl py-3 mt-8 transition-all cursor-pointer"
            onClick={handleSignOut}
            disabled={loading}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </Button>
        </div>
        <style>{`
          .project-list-item {
            cursor: pointer;
          }
          .project-list-item:hover {
            background: linear-gradient(90deg, #232526 0%, #414345 100%);
            color: #fff;
            box-shadow: 0 4px 16px 0 rgba(0,0,0,0.08);
          }
        `}</style>
      </aside>

      {/* Right Panel: Create Project */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/80 rounded-2xl shadow-2xl p-10 flex flex-col items-center gap-6 border border-white/40 backdrop-blur-md animate-fade-in">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2 tracking-tight">
            Create a New Project
          </h2>
          <form onSubmit={handleCreateProject} className="w-full flex flex-col gap-4">
            <input
              className="border-2 border-black focus:border-black focus:ring-2 focus:ring-black/20 rounded-xl px-4 py-2 text-base transition-all duration-300 outline-none shadow-sm bg-white/80 animate-input-pop"
              placeholder="Project Name"
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              required
              disabled={creating}
              style={{ transition: "box-shadow 0.3s, border-color 0.3s" }}
            />
            <button
              type="submit"
              disabled={creating}
              className="py-2 px-6 rounded-xl font-semibold text-base border border-black text-black bg-white hover:bg-gray-50 transition-all duration-200 outline-none shadow-sm focus:ring-2 focus:ring-black/20 cursor-pointer animate-input-pop"
              style={{ cursor: "pointer", width: "fit-content", alignSelf: "flex-end" }}
            >
              {creating ? "Creating..." : "Create Project"}
            </button>
          </form>
          {error && <div className="text-red-500 text-sm">{error.message}</div>}
        </div>
        <style>{`
          .animate-fade-in {
            animation: fadeInUp 0.7s cubic-bezier(.4,0,.2,1) both;
          }
          .animate-input-pop {
            animation: inputPop 0.9s cubic-bezier(.4,0,.2,1) both;
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px) scale(0.98);}
            to { opacity: 1; transform: none;}
          }
          @keyframes inputPop {
            0% { opacity: 0; transform: scale(0.97);}
            100% { opacity: 1; transform: scale(1);}
          }
        `}</style>
      </main>
    </div>
  )
}