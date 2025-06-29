import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import Groq from "groq-sdk";

// Chart.js
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
);

import { GROQ } from "@/config";
const GROQ_API_KEY = GROQ.API_KEY;

export default function ProjectKeywords({ projectId, interviews, keywords, setKeywords }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastAnalysis, setLastAnalysis] = useState(null);

  const transcript =
    interviews?.map((i) => i.transcript).filter(Boolean).join("\n\n") || "";

  const analyze = async () => {
    setLoading(true);
    setError("");

    try {
      const groq = new Groq({
        apiKey: GROQ_API_KEY,
        dangerouslyAllowBrowser: true,
      });

      const prompt = `
You are an AI research assistant. Analyze the following interview transcript and extract the most relevant qualitative research keywords.
Group them under thematic categories (like Economy, Environment, Gender, etc), and for each keyword, provide a short explanation and the exact matching quote from the transcript.
(try to find as much as possible, but don't force it if there are no clear keywords)
Return your response only as a JSON array of this format:
[
  {
    "category": "Category Name",
    "keywords": [
      {
        "term": "keyword",
        "description": "short explanation",
        "quote": "exact excerpt from the interview"
      }
    ]
  }
]

Transcript:
${transcript}
      `.trim();

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "deepseek-r1-distill-llama-70b",
        temperature: 0.6,
        max_completion_tokens: 2048,
        top_p: 0.9,
      });

      let content = chatCompletion.choices?.[0]?.message?.content || "";
      console.log("Groq raw content:", content);

     // Parse JSON with fallback
      let jsonText = "";
      const jsonMatch = content.match(/```json\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1].trim();
      } else {
        const arrayMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (arrayMatch) {
          jsonText = arrayMatch[0];
        } else {
          throw new Error("No valid JSON array found in response.");
        }
      }

      console.log("Extracted JSON:", jsonText);
      const parsed = JSON.parse(jsonText);
      setKeywords(parsed);

      const timestamp = new Date();
      setLastAnalysis(timestamp);
      localStorage.setItem(
        `keywords-${projectId}`,
        JSON.stringify({ keywords: parsed, lastAnalysis: timestamp })
      );
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Analysis failed: " + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem(`keywords-${projectId}`);
    if (cached) {
      const { keywords, lastAnalysis } = JSON.parse(cached);
      setKeywords(keywords);
      setLastAnalysis(new Date(lastAnalysis));
    } else if (transcript) {
      analyze();
    }
  }, [transcript]);

  const chartData = {
    labels: keywords.map((group) => group.category),
    datasets: [
      {
        label: "Number of Keywords",
        data: keywords.map((group) => group.keywords.length),
        backgroundColor: [
          "#1d4ed8",
          "#059669",
          "#f59e0b",
          "#dc2626",
          "#8b5cf6",
          "#0ea5e9",
        ],
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

 const chartOptions = {
  responsive: true,
  animation: {
    duration: 1000,
    easing: "easeOutBounce",
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "#111827",
      titleFont: { size: 14 },
      bodyFont: { size: 12 },
      padding: 12,
    },
    title: {
      display: false,
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: "Keyword Category",
        font: { size: 14, weight: "bold" },
        color: "#374151",
      },
      grid: { display: false },
      ticks: { color: "#374151", font: { size: 12 } },
    },
    y: {
      title: {
        display: true,
        text: "Number of Keywords",
        font: { size: 14, weight: "bold" },
        color: "#374151",
      },
      grid: { color: "#e5e7eb", borderDash: [4, 4] },
      ticks: { beginAtZero: true, color: "#4b5563" },
    },
  },
};

  return (
    <div className="w-full max-w-5xl mx-auto py-8 space-y-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <CardTitle>Keywords Analysis</CardTitle>
          <div className="flex items-center gap-2">
            {lastAnalysis && (
              <Badge variant="outline" className="text-xs">
                Last analyzed: {lastAnalysis.toLocaleString()}
              </Badge>
            )}
            <Button
              onClick={analyze}
              disabled={loading}
              className="cursor-pointer"
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
            </div>
          ) : keywords.length === 0 ? (
            <p className="text-gray-500 text-center">No keywords found yet.</p>
          ) : (
            <>
              <div className="space-y-6">
                {keywords.map((group, idx) => (
                  <div key={idx} className="space-y-2 border-b pb-4">
                    <h3 className="text-lg font-semibold text-primary">{group.category}</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      {group.keywords.map((kw, i) => (
                        <li key={i}>
                          <span className="font-medium">{kw.term}</span>: {kw.description}
                          <blockquote className="mt-1 ml-4 text-muted-foreground italic border-l-2 border-gray-300 pl-3">
                            “{kw.quote}”
                          </blockquote>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* 👇 Animated Bar Chart Visualization */}
              <Card className="mt-8 shadow-sm border border-muted">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Keyword Category Frequency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[300px]">
                    <Bar data={chartData} options={chartOptions} />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
