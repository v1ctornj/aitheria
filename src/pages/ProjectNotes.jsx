import { useEffect, useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Copy, Check, Trash2, Undo2 } from "lucide-react";

export default function ProjectNotes({ projectId, interviews, note, setNote }) {
  const [lastSaved, setLastSaved] = useState(null);
  const [status, setStatus] = useState("");
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredNote, setFilteredNote] = useState("");
  const [copied, setCopied] = useState(false);
  const [quoteSearch, setQuoteSearch] = useState("");
  const textareaRef = useRef(null);

  // Load saved note from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`notes-${projectId}`);
    if (saved) {
      const { content, timestamp, history: savedHistory } = JSON.parse(saved);
      setNote(content);
      setFilteredNote(content);
      setLastSaved(new Date(timestamp));
      setHistory(savedHistory || []);
    }
  }, [projectId]);

  // Save note to localStorage
  const saveNote = () => {
    const timestamp = new Date();
    const newHistory = [...history, { content: note, timestamp }];
    localStorage.setItem(
      `notes-${projectId}`,
      JSON.stringify({ content: note, timestamp, history: newHistory })
    );
    setLastSaved(timestamp);
    setHistory(newHistory);
    setStatus("saved");
    setTimeout(() => setStatus(""), 1500);
  };

  // Undo last change
  const undoNote = () => {
    if (history.length > 0) {
      const prev = history[history.length - 2] || { content: "", timestamp: null };
      setNote(prev.content);
      setFilteredNote(prev.content);
      setLastSaved(prev.timestamp ? new Date(prev.timestamp) : null);
      setHistory(history.slice(0, -1));
      setStatus("undone");
      setTimeout(() => setStatus(""), 1500);
    }
  };

  // Delete note
  const deleteNote = () => {
    localStorage.removeItem(`notes-${projectId}`);
    setNote("");
    setFilteredNote("");
    setLastSaved(null);
    setHistory([]);
    setStatus("deleted");
    setTimeout(() => setStatus(""), 1500);
  };

  // Copy note to clipboard
  const copyNote = () => {
    navigator.clipboard.writeText(note);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  // Search/filter note
  useEffect(() => {
    if (!search) {
      setFilteredNote(note);
    } else {
      // Highlight search term
      const regex = new RegExp(`(${search})`, "gi");
      setFilteredNote(note.replace(regex, "<mark class='bg-yellow-200'>$1</mark>"));
    }
  }, [search, note]);

  // Insert interview quote
  const insertQuote = (quote) => {
    const newNote = note + `\n\n> "${quote}"`;
    setNote(newNote);
    setFilteredNote(newNote);
    textareaRef.current?.focus();
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 space-y-6">
      <Card className="shadow-xl border-pastel-pink/60 border animate-fade-in-up">
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <CardTitle>Project Notes</CardTitle>
          {lastSaved && (
            <Badge variant="outline" className="text-xs">
              Last saved: {lastSaved.toLocaleString()}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="edit" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="edit">
              <div className="flex flex-col gap-2">
                <Textarea
                  ref={textareaRef}
                  placeholder="Write your research notes here..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={10}
                  className="resize-none text-sm"
                />
                <div className="flex flex-wrap gap-2 justify-between items-center">
                  <div className="flex gap-2">
                    <Button onClick={saveNote} className="border border-black hover:bg-muted" size="sm">
                      <Check className="w-4 h-4 mr-1" /> Save
                    </Button>
                    <Button onClick={undoNote} className="border border-black hover:bg-muted" size="sm" disabled={history.length < 2}>
                      <Undo2 className="w-4 h-4 mr-1" /> Undo
                    </Button>
                    <Button onClick={deleteNote} className="border border-red-400 text-red-600 hover:bg-red-50" size="sm">
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                  <Button onClick={copyNote} variant="outline" size="sm">
                    {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
                {status === "saved" && (
                  <Alert variant="success" className="mt-2">
                    <AlertTitle>Saved!</AlertTitle>
                    <AlertDescription>Your note has been saved.</AlertDescription>
                  </Alert>
                )}
                {status === "undone" && (
                  <Alert variant="info" className="mt-2">
                    <AlertTitle>Undone!</AlertTitle>
                    <AlertDescription>Last change has been undone.</AlertDescription>
                  </Alert>
                )}
                {status === "deleted" && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertTitle>Deleted!</AlertTitle>
                    <AlertDescription>Your note has been deleted.</AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
            <TabsContent value="preview">
              <div className="prose prose-sm max-w-none border rounded p-4 bg-muted/40 min-h-[160px]">
                {filteredNote ? (
                  <span dangerouslySetInnerHTML={{ __html: filteredNote.replace(/\n/g, "<br/>") }} />
                ) : (
                  <span className="text-gray-400">Nothing to preview.</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Input
                  placeholder="Search in notes…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-64"
                />
                {search && (
                  <Button variant="ghost" size="sm" onClick={() => setSearch("")}>
                    Clear
                  </Button>
                )}
              </div>
            </TabsContent>
            <TabsContent value="history">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {history.length === 0 ? (
                  <span className="text-gray-400">No history yet.</span>
                ) : (
                  history
                    .slice()
                    .reverse()
                    .map((h, idx) => (
                      <div key={idx} className="border rounded p-2 bg-muted/30">
                        <div className="text-xs text-gray-500 mb-1">
                          {h.timestamp ? new Date(h.timestamp).toLocaleString() : ""}
                        </div>
                        <div className="text-sm whitespace-pre-line">{h.content}</div>
                      </div>
                    ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="justify-end text-xs text-gray-400">
          Notes are stored locally in your browser.
        </CardFooter>
      </Card>
      <style>{`
        .animate-fade-in-up {
          animation: fadeInUpCard 0.7s cubic-bezier(.4,0,.2,1) both;
        }
        @keyframes fadeInUpCard {
          from { opacity: 0; transform: translateY(30px) scale(0.98);}
          to { opacity: 1; transform: none;}
        }
        mark {
          background: #fef08a;
          color: #222;
          border-radius: 2px;
          padding: 0 2px;
        }
      `}</style>
    </div>
  );
}
