import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Lightbulb, List, StickyNote, BookOpen } from "lucide-react";
import { saveAs } from "file-saver";

export default function ProjectExport({
  project,
  projectId,
  interviews = [],
  themes = [],
  keywords = [],
  context = [],
  notes = "",
}) {
  const exportData = useMemo(
    () => ({
      project: project ? { id: projectId, name: project.name } : {},
      interviews: interviews.map(i => ({
        id: i.$id,
        title: i.title,
        transcript: i.transcript,
        keywords: i.keywords,
        dateTime: i.dateTime,
        audioFileId: i.audioFileId,
      })),
      insights: themes,
      keywords,
      context,
      notes,
    }),
    [project, projectId, interviews, themes, keywords, context, notes]
  );

  const [exporting, setExporting] = useState(false);

  const handleExportJSON = () => {
    setExporting(true);
    const filename =
      window.prompt("Enter filename for export (without extension):", "project_export");
    if (!filename) {
      setExporting(false);
      return; // User cancelled, do nothing
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, `${filename}.json`);
    setExporting(false);
  };

  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center py-12 px-2 bg-gradient-to-br from-white via-pastel-pink/30 to-blue-50">
      <Card className="w-full max-w-2xl shadow-2xl border-pastel-pink/60 border animate-fade-in-up">
        <CardHeader className="flex flex-col items-center gap-2 pb-2">
          <Download className="w-10 h-10 text-pastel-pink mb-2" />
          <CardTitle className="text-2xl font-bold text-center">Export Project Data</CardTitle>
          <Badge variant="outline" className="text-xs mt-2">
            Project ID: {projectId}
          </Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SummaryItem
              icon={<BookOpen className="w-5 h-5 text-pastel-pink" />}
              label="Project"
              value={project?.name || <span className="text-gray-400">No project name</span>}
            />
            <SummaryItem
              icon={<FileText className="w-5 h-5 text-pastel-pink" />}
              label="Interviews"
              value={interviews.length}
            />
            <SummaryItem
              icon={<Lightbulb className="w-5 h-5 text-pastel-pink" />}
              label="Insights"
              value={themes.length}
            />
            <SummaryItem
              icon={<List className="w-5 h-5 text-pastel-pink" />}
              label="Keywords"
              value={keywords.length}
            />
            <SummaryItem
              icon={<StickyNote className="w-5 h-5 text-pastel-pink" />}
              label="Notes"
              value={notes ? "Yes" : <span className="text-gray-400">No notes</span>}
            />
           
          </div>
          <div className="mt-6 flex flex-col items-center">
            <Button
              onClick={handleExportJSON}
              disabled={exporting}
              className="border border-black hover:cursor-pointer outline"
              size="lg"
            >
              <Download className="w-5 h-5" />
              {exporting ? "Exporting..." : "Export as JSON"}
            </Button>
            <div className="text-xs text-gray-400 mt-4 text-center">
              This will export all project data as a JSON file for backup or analysis.
            </div>
          </div>
        </CardContent>
        <CardFooter />
      </Card>
      <style>{`
        .animate-fade-in-up {
          animation: fadeInUpCard 0.7s cubic-bezier(.4,0,.2,1) both;
        }
        @keyframes fadeInUpCard {
          from { opacity: 0; transform: translateY(30px) scale(0.98);}
          to { opacity: 1; transform: none;}
        }
      `}</style>
    </div>
  );
}

function SummaryItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 bg-pastel-pink/10 rounded-lg px-4 py-3 shadow-sm">
      {icon}
      <span className="font-medium">{label}:</span>
      <span className="ml-auto">{value}</span>
    </div>
  );
}