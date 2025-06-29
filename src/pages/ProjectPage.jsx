import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { databases, storage, ID } from "@/appwrite/client";
import { Button } from "@/components/ui/button";
import { Upload, StickyNote, Download, Lightbulb, List, Pencil, Check, FileText, Trash2, LogOut } from "lucide-react";
import axios from "axios";
import ProjectInsights from "./ProjectInsights"; // Add this import at the top
import ProjectKeywords from "./ProjectKeywords";
import ProjectNotes from "./ProjectNotes";
import ProjectContextualization from "./ProjectContextualization" ;
import ProjectExport  from "./ProjectExport";
import { account } from "@/appwrite/client"; // Adjust the import path as needed
import logo from '/logo.png';
import useStore from "@/store";

//import { APPWRITE, ASSEMBLY } from "@/config";
// constants for Appwrite and AssemblyAI
// Replace these with your actual Appwrite and AssemblyAI configuration
// The API keys and IDs should be replaced with your actual Appwrite IDs
// The API Keys are exposed here for demonstration purposes only.
// In a real-world application, you should never expose your API keys in the frontend.
// Always use environment variables and server-side functions to handle sensitive operations securely.

const DATABASE_ID = "685121b70037b398f4a7";
const COLLECTION_ID = "6851221a003005960079";
const INTERVIEWS_COLLECTION_ID = "685122df0018fb587665";
const BUCKET_ID = "685128ac00208b640f12";
const ASSEMBLY_API_KEY = "7cc34953f0ee4a07b295f124fb1d387f";
const ASSEMBLY_BASE_URL = "https://api.assemblyai.com/v2";

const TABS = [
    { key: "interviews", label: "Interviews", icon: <Upload className="w-4 h-4" /> },
    { key: "insights", label: "Insights", icon: <Lightbulb className="w-4 h-4" /> },
    { key: "keywords", label: "Keywords", icon: <List className="w-4 h-4" /> },
   
    { key: "notes", label: "Notes", icon: <StickyNote className="w-4 h-4" /> },
    { key: "export", label: "Export", icon: <Download className="w-4 h-4" /> }
    //{ key: "contextualize", label: "Contextualize", icon: <StickyNote className="w-4 h-4" /> },
]

export default function ProjectDashboard() {
    const { projectId } = useParams();
    const userId = useStore(state => state.userId);
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
    const [transcriptPreview, setTranscriptPreview] = useState("");
    const fileInputRef = useRef(null);

    // Refresh state for interviews
    const [refreshInterviews, setRefreshInterviews] = useState(false);

    // Transcript state
    const [showTranscript, setShowTranscript] = useState(false);
    const [transcriptContent, setTranscriptContent] = useState("");
    const [transcriptTitle, setTranscriptTitle] = useState("");

    // New state variables for themes, keywords, context, and notes
    const [themes, setThemes] = useState([]);
    const [keywords, setKeywords] = useState([]);
    const [context, setContext] = useState([]);
    const [notes, setNotes] = useState("");

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
                .listDocuments(DATABASE_ID, INTERVIEWS_COLLECTION_ID, [])
                .then(res => {
                    const filtered = res.documents.filter(doc => doc.projectId == projectId);
                    setInterviews(filtered);
                })
                .catch(() => {
                    setInterviews([]);
                })
                .finally(() => setInterviewsLoading(false));
        }
    }, [tab, projectId, refreshInterviews]);

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
            await databases.deleteDocument(DATABASE_ID, INTERVIEWS_COLLECTION_ID, interviewId);
            setRefreshInterviews(r => !r);
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
            return audioFile.$id;
        } catch (err) {
            setUploadError("Audio upload failed: " + err.message);
            return null;
        }
    };

    // Upload audio file to AssemblyAI and get their audio_url
    const uploadToAssemblyAI = async (file) => {
        const uploadRes = await axios.post(
            `${ASSEMBLY_BASE_URL}/upload`,
            file,
            {
                headers: {
                    authorization: ASSEMBLY_API_KEY,
                    "content-type": file.type,
                },
            }
        );
        return uploadRes.data.upload_url;
    };

    // Transcribe audio using AssemblyAI
    const transcribeWithAssemblyAI = async (audioUrl) => {
        const transcriptRes = await axios.post(
            `${ASSEMBLY_BASE_URL}/transcript`,
            {
                audio_url: audioUrl,
                speech_model: "universal",
            },
            {
                headers: { authorization: ASSEMBLY_API_KEY },
            }
        );
        const transcriptId = transcriptRes.data.id;
        const pollingEndpoint = `${ASSEMBLY_BASE_URL}/transcript/${transcriptId}`;

        while (true) {
            const pollingRes = await axios.get(pollingEndpoint, {
                headers: { authorization: ASSEMBLY_API_KEY },
            });
            const status = pollingRes.data.status;
            if (status === "completed") {
                return pollingRes.data.text;
            } else if (status === "error") {
                throw new Error(`Transcription failed: ${pollingRes.data.error}`);
            } else {
                await new Promise((resolve) => setTimeout(resolve, 3000));
            }
        }
    };

    // 3. Create the interview document with audioFileId and transcript
    const createInterviewDocument = async (audioFileId, title, transcript) => {
        try {
            await databases.createDocument(
                DATABASE_ID,
                INTERVIEWS_COLLECTION_ID,
                ID.unique(),
                {
                    projectId,
                    title,
                    transcript: transcript || "",
                    keywords: "",
                    dateTime: new Date().toISOString(),
                    audioFileId,
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
        setTranscriptPreview("");
        try {
            const audioFileId = await uploadAudioFile(uploadFile);
            if (!audioFileId) {
                setUploadError("Audio file upload failed.");
                setUploading(false);
                return;
            }
            const assemblyAudioUrl = await uploadToAssemblyAI(uploadFile);
            let transcript = "";
            try {
                transcript = await transcribeWithAssemblyAI(assemblyAudioUrl);
                setTranscriptPreview(transcript);
            } catch (err) {
                setUploadError("Transcription failed: " + err.message);
                transcript = "";
                setTranscriptPreview("");
            }
            await createInterviewDocument(audioFileId, uploadTitle, transcript);
            setShowUpload(false);
            setUploadFile(null);
            setUploadTitle("");
            setTranscriptPreview("");
            setRefreshInterviews(r => !r);
        } catch (err) {
            setUploadError("Upload failed: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    // --- Minimal Upload Modal, centered ---
    if (showUpload) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <form
                    onSubmit={handleUploadInterview}
                    className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xs flex flex-col gap-4 animate-fade-in"
                    style={{ minWidth: 280 }}
                >
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-lg text-gray-800">Upload Audio</span>
                        <button
                            type="button"
                            className="text-gray-400 hover:text-black text-xl transition"
                            onClick={() => {
                                setShowUpload(false);
                                setUploadFile(null);
                                setUploadTitle("");
                                setUploadError("");
                                setTranscriptPreview("");
                            }}
                            aria-label="Close"
                        >
                            ×
                        </button>
                    </div>
                    <input
                        type="text"
                        className="border rounded px-3 py-2 text-sm"
                        placeholder="Title"
                        value={uploadTitle}
                        onChange={e => setUploadTitle(e.target.value)}
                        required
                    />
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={e => {
                            setUploadFile(e.target.files[0]);
                            setTranscriptPreview("");
                        }}
                        required
                    />
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            onClick={() => fileInputRef.current && fileInputRef.current.click()}
                            className={`flex-1 bg-pastel-pink text-black rounded transition-all duration-150 py-2
                                ${uploadFile ? "scale-100" : "scale-95 hover:scale-100"}
                            `}
                        >
                            {uploadFile ? (
                                <span className="truncate flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-pastel-pink" />
                                    {uploadFile.name}
                                </span>
                            ) : (
                                "Browse"
                            )}
                        </Button>
                        {uploadFile && (
                            <button
                                type="button"
                                className="p-1 rounded-full hover:bg-red-100 transition"
                                title="Remove file"
                                onClick={() => {
                                    setUploadFile(null);
                                    setTranscriptPreview("");
                                    if (fileInputRef.current) fileInputRef.current.value = "";
                                }}
                            >
                                <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                        )}
                    </div>
                    <Button
                        type="submit"
                        disabled={uploading}
                        className="w-full bg-black text-white rounded py-2 hover:bg-gray-900 transition"
                    >
                        {uploading ? "Uploading & Transcribing..." : "Upload"}
                    </Button>
                    {uploadError && <div className="text-red-500 text-xs">{uploadError}</div>}
                    {transcriptPreview && (
                        <div className="bg-gray-50 border rounded p-2 text-xs text-gray-700 max-h-24 overflow-y-auto">
                            <div className="font-semibold mb-1">Transcript Preview:</div>
                            <div className="whitespace-pre-line">{transcriptPreview.slice(0, 400)}{transcriptPreview.length > 400 ? "..." : ""}</div>
                        </div>
                    )}
                </form>
                <style>{`
                    .animate-fade-in {
                        animation: fadeInUp 0.4s cubic-bezier(.4,0,.2,1) both;
                    }
                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(24px) scale(0.98);}
                        to { opacity: 1; transform: none;}
                    }
                `}</style>
            </div>
        );
    }

    // --- Main content ---
    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    if (!project) return <div className="flex items-center justify-center min-h-screen text-red-500">Project not found.</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-pastel-pink/40 to-blue-50 font-sans">
            {/* Top Bar */}
            <header className="flex items-center justify-between px-8 py-6 sticky top-0 z-20 bg-white/80 backdrop-blur-md shadow-sm">
                <div className="flex items-center gap-4">
                    <img
                        src={logo}
                        alt="aitheria"
                        className="h-12 w-12 object-contain hover:cursor-pointer"
                        onClick={() => navigate("/dashboard")}
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
                                    className="ml-1 bg-pastel-pink text-black hover:bg-pastel-pink/80 rounded-full hover:cursor-pointer"
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
                {/* Sign Out Button at Top Right */}
                <Button
                    variant="outline"
                    className="flex items-center gap-2 rounded-full px-5 py-2 border-black text-black transition hover:bg-pastel-pink/40 hover:shadow-pink-200 hover:shadow-md hover:cursor-pointer"
                    onClick={async () => {
                        try {
                            await account.deleteSession("current");
                            navigate("/login");
                        } catch (err) {
                            console.error("Sign out failed:", err);
                        }
                    }}
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
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
                                                {interview.transcript && (
                                                    <div className="text-xs text-gray-500 mt-2 max-w-xs truncate">
                                                        {interview.transcript}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 group/audiofile">
                                                <FileText
                                                    className="w-6 h-6 text-pastel-pink cursor-pointer hover:scale-110 transition"
                                                    title="Show transcript"
                                                    onClick={() => {
                                                        setTranscriptContent(interview.transcript || "No transcript available.");
                                                        setTranscriptTitle(interview.title || "");
                                                        setShowTranscript(true);
                                                    }}
                                                />
                                                <button
                                                    className="opacity-80 hover:opacity-100 transition-opacity rounded-full p-1 hover:bg-red-100"
                                                    title="Delete audio file"
                                                    onClick={() => handleDeleteAudio(interview.audioFileId, interview.$id)}
                                                    disabled={deletingAudioId === interview.audioFileId}
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                    {tab === "insights" && (
                        <ProjectInsights
                          projectId={projectId}
                          interviews={interviews}
                          themes={themes}
                          setThemes={setThemes}
                        />
                    )}
                    {tab === "keywords" && (
                       <ProjectKeywords
                         projectId={projectId}
                         interviews={interviews}
                         keywords={keywords}
                         setKeywords={setKeywords}
                       />
                    )}
                   {tab === "contextualize" && (
                      <ProjectContextualization
                        projectId={projectId}
                        themes={themes}
                        context={context}
                        setContext={setContext}
                      />
                    )}
                   {tab === "notes" && (
                      <ProjectNotes
                        userId={userId}
                        projectId={projectId}
                        interviews={interviews}
                        note={notes}
                        setNote={setNotes}
                      />
                    )}
                    {tab === "export" && (
  <ProjectExport
    project={project}
    projectId={projectId}
    interviews={interviews}
    themes={themes}
    keywords={keywords}
    context={context}
    notes={notes}
  />
)}

                </section>
            </main>
            {showTranscript && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg flex flex-col gap-4 animate-fade-in">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-lg text-gray-800">
                                Transcript: {transcriptTitle}
                            </span>
                            <button
                                type="button"
                                className="text-gray-400 hover:text-black text-xl transition"
                                onClick={() => setShowTranscript(false)}
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>
                        <div className="text-sm text-gray-700 whitespace-pre-line max-h-96 overflow-y-auto">
                            {transcriptContent}
                        </div>
                    </div>
                </div>
            )}
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