import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { databases, storage, ID } from "@/appwrite/client";
import { Button } from "@/components/ui/button";
import { Upload, StickyNote, Download, Lightbulb, List, Pencil, Check, FileText, Trash2 } from "lucide-react";
// All IDs should be replaced with your actual Appwrite IDs
// These IDs are for demonstration purposes only and should not be used in production code
// Always use environment variables and server-side functions to handle sensitive operations securely.

const DATABASE_ID = "685121b70037b398f4a7";
const COLLECTION_ID = "6851221a003005960079";
const INTERVIEWS_COLLECTION_ID = "685122df0018fb587665"; // Replace with your interviews collection ID
const BUCKET_ID = "685128ac00208b640f12";

const TABS = [
    { key: "interviews", label: "Interviews", icon: <Upload className="w-4 h-4" /> },
    { key: "insights", label: "Insights", icon: <Lightbulb className="w-4 h-4" /> },
    { key: "keywords", label: "Keywords", icon: <List className="w-4 h-4" /> },
    { key: "notes", label: "Notes", icon: <StickyNote className="w-4 h-4" /> },
];

export default function ProjectDashboard() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState(TABS[0].key);
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [saving, setSaving] = useState(false);
    const inputRef = useRef(null);

    // Interview state
    const [interviews, setInterviews] = useState([]);
    const [interviewsLoading, setInterviewsLoading] = useState(false);
    const [deletingAudioId, setDeletingAudioId] = useState(null);

    // Upload modal state
    const [showUpload, setShowUpload] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadTitle, setUploadTitle] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");

    useEffect(() => {
        databases.getDocument(DATABASE_ID, COLLECTION_ID, projectId)
            .then(doc => {
                setProject(doc);
                setEditName(doc.name);
            })
            .finally(() => setLoading(false));
    }, [projectId]);

    // Fetch interviews for this project
    useEffect(() => {
        if (tab === "interviews") {
            setInterviewsLoading(true);
            databases
                .listDocuments(INTERVIEWS_COLLECTION_ID, [
                    //Query.equal("projectId", projectId)
                ])
                .then(res => {
                    const filtered = res.documents.filter(doc => doc.projectId === projectId);
                    setInterviews(filtered);
                })
                .catch(() => setInterviews([]))
                .finally(() => setInterviewsLoading(false));
        }
    }, [tab, projectId, uploading]);

    // Focus input when editing
    useEffect(() => {
        if (editing && inputRef.current) inputRef.current.focus();
    }, [editing]);

    // Save new name to Appwrite and update state
    const handleRename = async () => {
        if (!editName.trim() || editName === project.name) {
            setEditing(false);
            setEditName(project.name);
            return;
        }
        setSaving(true);
        try {
            const updated = await databases.updateDocument(
                DATABASE_ID,
                COLLECTION_ID,
                projectId,
                { name: editName.trim() }
            );
            setProject(updated);
            setEditName(updated.name);
            setEditing(false);
        } finally {
            setSaving(false);
        }
    };

    const getAudioUrl = (audioFileId) => {
        return storage.getFileView(BUCKET_ID, audioFileId).href;
    };

    // Delete audio file from bucket and update interview list
    const handleDeleteAudio = async (audioFileId, interviewId) => {
        if (!window.confirm("Are you sure you want to delete this audio file?")) return;
        setDeletingAudioId(audioFileId);
        try {
            await storage.deleteFile(BUCKET_ID, audioFileId);
            // Optionally, you may want to also delete the interview document or update it to remove audioFileId
            setInterviews(prev => prev.filter(i => i.audioFileId !== audioFileId));
        } catch (err) {
            alert("Failed to delete audio file: " + err.message);
        } finally {
            setDeletingAudioId(null);
        }
    };

    // 1. Upload the audio file first
    const uploadAudioFile = async (file) => {
        try {
            const audioFile = await storage.createFile(BUCKET_ID, ID.unique(), file);
            return audioFile.$id; // Return the file ID
        } catch (err) {
            setUploadError("Audio upload failed: " + err.message);
            return null;
        }
    };

    // 2. Create the interview document with audioFileId
    const createInterviewDocument = async (audioFileId, title) => {
        try {
            await databases.createDocument(
                DATABASE_ID,
                INTERVIEWS_COLLECTION_ID,
                ID.unique(),
                {
                    projectId,
                    title,
                    transcript: "",
                    keywords: "",
                    dateTime: new Date().toISOString(),
                    audioFileId, // This must be present and valid!
                }
            );
        } catch (err) {
            setUploadError("Saving interview failed: " + err.message);
        }
    };

    // Main upload handler
    const handleUploadInterview = async (e) => {
        e.preventDefault();
        setUploadError("");
        if (!uploadFile || !uploadTitle) {
            setUploadError("Please provide both a file and a title.");
            return;
        }
        setUploading(true);
        try {
            // 1. Wait for the upload to finish and get the file ID
            const audioFileId = await uploadAudioFile(uploadFile);
            if (!audioFileId) {
                setUploadError("Audio file upload failed.");
                setUploading(false);
                return;
            }
            // 2. Only then, create the interview document
            await createInterviewDocument(audioFileId, uploadTitle);
            setShowUpload(false);
            setUploadFile(null);
            setUploadTitle("");
        } catch (err) {
            setUploadError("Upload failed: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    if (!project) return <div className="flex items-center justify-center min-h-screen text-red-500">Project not found.</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-pastel-pink/40 to-blue-50 font-sans">
            {/* Top Bar */}
            <header className="flex items-center justify-between px-8 py-6 sticky top-0 z-20 bg-white/80 backdrop-blur-md shadow-sm">
                <div className="flex items-center gap-4">
                    <img
                        src="/logo.png"
                        alt="Aitheria Logo"
                        className="h-10 w-10 rounded-full shadow cursor-pointer hover:scale-105 hover:shadow-lg transition"
                        onClick={() => navigate("/dashboard")}
                        style={{ background: "white" }}
                        title="Back to dashboard"
                        tabIndex={0}
                        onKeyDown={e => { if (e.key === "Enter") navigate("/dashboard") }}
                    />
                    {/* Editable Project Title */}
                    <div className="flex items-center gap-2 group">
                        {editing ? (
                            <>
                                <input
                                    ref={inputRef}
                                    className="text-2xl font-bold tracking-tight text-gray-900 bg-transparent border-b-2 border-pastel-pink focus:outline-none px-2 py-1 transition"
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === "Enter") handleRename();
                                        if (e.key === "Escape") {
                                            setEditing(false);
                                            setEditName(project.name);
                                        }
                                    }}
                                    disabled={saving}
                                    style={{ minWidth: 120, maxWidth: 320 }}
                                />
                                <Button
                                    size="icon"
                                    className="ml-1 bg-pastel-pink text-black hover:bg-pastel-pink/80 rounded-full"
                                    onClick={handleRename}
                                    disabled={saving}
                                    aria-label="Save"
                                    type="button"
                                >
                                    <Check className="w-5 h-5" />
                                </Button>
                            </>
                        ) : (
                            <>
                                <span
                                    className="text-2xl font-bold tracking-tight text-gray-900 px-2 py-1 rounded transition group-hover:bg-pastel-pink/30 cursor-pointer"
                                    onClick={() => setEditing(true)}
                                    tabIndex={0}
                                    onKeyDown={e => { if (e.key === "Enter") setEditing(true) }}
                                    title="Click to rename"
                                    style={{ outline: "none" }}
                                >
                                    {project.name}
                                </span>
                                <Pencil
                                    className="w-5 h-5 text-pastel-pink opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                    onClick={() => setEditing(true)}
                                    title="Rename"
                                />
                            </>
                        )}
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="flex items-center gap-2 rounded-full px-5 py-2 bg-black text-white hover:bg-gray-900 transition"
                >
                    <Download className="w-4 h-4" />
                    Export
                </Button>
            </header>

            {/* Floating Tabs */}
            <nav className="flex justify-center mt-12 mb-10">
                <div className="flex bg-white/90 shadow-lg rounded-full px-2 py-2 gap-2">
                    {TABS.map(({ key, label, icon }) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium text-base transition-all
                ${tab === key
                                    ? "bg-pastel-pink/80 text-black shadow"
                                    : "text-gray-500 hover:bg-pastel-pink/40 hover:text-black"}
              `}
                            style={{ cursor: "pointer" }}
                        >
                            {icon}
                            {label}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Section Content */}
            <main className="flex flex-col items-center justify-center min-h-[40vh] px-4">
                <section className="w-full max-w-2xl bg-white/90 rounded-3xl shadow-xl p-10 flex flex-col items-center gap-8 animate-fade-in">
                    {tab === "interviews" && (
                        <>
                            <Button
                                className="bg-black text-white rounded-full px-6 py-3 hover:bg-gray-900 transition mb-4"
                                onClick={() => setShowUpload(true)}
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Interview
                            </Button>
                            {showUpload && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                                    <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative">
                                        <button
                                            className="absolute top-2 right-2 text-gray-400 hover:text-black"
                                            onClick={() => {
                                                setShowUpload(false);
                                                setUploadFile(null);
                                                setUploadTitle("");
                                                setUploadError("");
                                            }}
                                        >
                                            ×
                                        </button>
                                        <form onSubmit={handleUploadInterview} className="flex flex-col gap-4">
                                            <input
                                                type="text"
                                                className="border rounded px-3 py-2"
                                                placeholder="Interview Title"
                                                value={uploadTitle}
                                                onChange={e => setUploadTitle(e.target.value)}
                                                required
                                            />
                                            <input
                                                type="file"
                                                accept="audio/*"
                                                onChange={e => setUploadFile(e.target.files[0])}
                                                required
                                            />
                                            <Button
                                                type="submit"
                                                disabled={uploading}
                                                className="w-full"
                                            >
                                                {uploading ? "Uploading..." : "Upload"}
                                            </Button>
                                            {uploadError && <div className="text-red-500">{uploadError}</div>}
                                        </form>
                                    </div>
                                </div>
                            )}
                            {interviewsLoading ? (
                                <div className="text-gray-400 text-lg text-center">
                                    Loading interviews...
                                </div>
                            ) : interviews.length === 0 ? (
                                <div className="text-gray-400 text-lg text-center">
                                    No interviews uploaded yet.
                                </div>
                            ) : (
                                <div className="w-full">
                                    {interviews.map(interview => (
                                        <div
                                            key={interview.$id}
                                            className="flex items-center justify-between bg-white rounded-lg shadow p-4 mb-4 transition-all hover:shadow-lg"
                                        >
                                            <div className="flex-1 pr-4">
                                                <div className="text-gray-800 font-semibold">
                                                    {interview.title}
                                                </div>
                                                <div className="text-gray-500 text-sm">
                                                    {new Date(interview.dateTime).toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 group/audiofile">
                                                <FileText className="w-6 h-6 text-pastel-pink" />
                                                {interview.audioFileId && (
                                                    <div className="relative flex items-center">
                                                        <audio
                                                            controls
                                                            src={getAudioUrl(interview.audioFileId)}
                                                            className="w-36"
                                                            style={{ background: "#fff", borderRadius: "0.5rem" }}
                                                        />
                                                        <button
                                                            className="absolute -top-2 -right-2 opacity-0 group-hover/audiofile:opacity-100 transition-opacity bg-white rounded-full p-1 shadow hover:bg-red-100"
                                                            title="Delete audio file"
                                                            onClick={() => handleDeleteAudio(interview.audioFileId, interview.$id)}
                                                            disabled={deletingAudioId === interview.audioFileId}
                                                            style={{ cursor: "pointer" }}
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                    {tab === "insights" && (
                        <div className="text-gray-400 text-lg text-center">
                            No insights yet.
                        </div>
                    )}
                    {tab === "keywords" && (
                        <div className="text-gray-400 text-lg text-center">
                            No keyword suggestions yet.
                        </div>
                    )}
                    {tab === "notes" && (
                        <>
                            <Button className="bg-black text-white rounded-full px-6 py-3 hover:bg-gray-900 transition mb-4">
                                <StickyNote className="w-4 h-4 mr-2" />
                                Add Note
                            </Button>
                            <div className="text-gray-400 text-lg text-center">
                                No notes yet.
                            </div>
                        </>
                    )}
                </section>
            </main>
            <style>{`
        .animate-fade-in {
          animation: fadeInUp 0.7s cubic-bezier(.4,0,.2,1) both;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px) scale(0.98);}
          to { opacity: 1; transform: none;}
        }
        .group\\/audiofile:hover .group-hover\\/audiofile\\:opacity-100 {
          opacity: 1 !important;
        }
      `}</style>
        </div>
    );
}