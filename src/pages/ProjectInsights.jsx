import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

import Groq from "groq-sdk";
import ProjectContextualization from "./ProjectContextualization";
import { GROQ } from "@/config";


const GROQ_API_KEY = GROQ.API_KEY;


export default function ProjectInsights({ projectId, interviews, themes, setThemes }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastAnalysis, setLastAnalysis] = useState(null);

  const transcript =
    interviews?.map((i) => i.transcript).filter(Boolean).join("\n\n") || "";

  const analyze = async () => {
    setLoading(true);
    setError("");
    //setThemes([]);
    try {
      const groq = new Groq({ apiKey: GROQ_API_KEY, dangerouslyAllowBrowser: true });

      const prompt = `
You are a qualitative research assistant. Analyze the following interview transcript and extract the main themes and their subpoints. 
Return your answer as a JSON array like: 
[{"theme": "Theme title", "subpoints": ["point 1", "point 2"]}]
Transcript:
${transcript}
      `.trim();

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "deepseek-r1-distill-llama-70b",
        temperature: 0.6,
        max_completion_tokens: 1024,
        top_p: 0.95,
      });

      let content = chatCompletion.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/```json\s*([\s\S]*?)```/);
      const jsonText = jsonMatch ? jsonMatch[1].trim() : null;
      const parsedThemes = jsonText ? JSON.parse(jsonText) : [];

      setThemes(parsedThemes);
      const timestamp = new Date();
      setLastAnalysis(timestamp);
      localStorage.setItem(
        `insights-${projectId}`,
        JSON.stringify({ themes: parsedThemes, lastAnalysis: timestamp })
      );
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Analysis failed: " + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem(`insights-${projectId}`);
    if (cached) {
      const { themes, lastAnalysis } = JSON.parse(cached);
      setThemes(themes);
      setLastAnalysis(new Date(lastAnalysis));
    } else if (transcript) {
      analyze();
    }
  }, [transcript]);

  const memoizedThemes = useMemo(() => themes, [themes]);

  return (
    <div className="w-full max-w-4xl mx-auto py-8 space-y-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
          <CardTitle>Project Insights</CardTitle>
          <div className="flex items-center gap-2">
            {lastAnalysis && (
              <Badge variant="outline" className="text-xs">
                Last analyzed: {lastAnalysis.toLocaleString()}
              </Badge>
            )}
           <Button
  
  className="cursor-pointer"
  onClick={analyze}
  disabled={loading}
>
  {loading ? "Analyzing..." : "Re-run Analysis"}
</Button>

          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ) : themes.length === 0 ? (
            <p className="text-gray-500 text-center">No insights found.</p>
          ) : (
            <Accordion type="multiple">
              {themes.map((theme, idx) => (
                <AccordionItem key={idx} value={`theme-${idx}`}>
                  <AccordionTrigger>{theme.theme}</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-6 space-y-1">
                      {theme.subpoints.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      <ProjectContextualization projectId={projectId} themes={memoizedThemes} />
    </div>
  );
}
