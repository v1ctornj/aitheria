import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ExternalLink } from "lucide-react";
import { TAVILY } from "@/config";

export default function ProjectContextualization({ projectId, themes, context, setContext }) {
  const [contextualData, setContextualData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);
  const [error, setError] = useState("");

  const fetchContextForThemes = async (themes) => {
    setLoading(true);
    setError("");
    const results = [];

    for (const theme of themes) {
      try {
        const res = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TAVILY.API_KEY}`,
          },
          body: JSON.stringify({
            query: `What is "${theme.theme}"?`,
            search_depth: "basic",
            include_answer: true,
          }),
        });

        const json = await res.json();
        let context = "No relevant external information found.";
        if (json.answer && json.answer.trim()) {
          context = json.answer.trim();
        } else if (
          json.results &&
          json.results.length > 0 &&
          json.results[0].content
        ) {
          context = json.results[0].content.slice(0, 400) + "…";
        }

        results.push({
          theme: theme.theme,
          context,
        });
      } catch (err) {
        results.push({
          theme: theme.theme,
          context: "Error fetching context.",
        });
      }
    }

    const timestamp = new Date();
    setContextualData(results);
    setLastFetch(timestamp);
    localStorage.setItem(
      `context-${projectId}`,
      JSON.stringify({ data: results, lastFetch: timestamp })
    );
    setLoading(false);

    // When you get new context:
    setContext(results);
  };

  useEffect(() => {
    if (!themes || themes.length === 0) return;

    const cached = localStorage.getItem(`context-${projectId}`);
    if (cached) {
      const { data, lastFetch } = JSON.parse(cached);
      setContextualData(data);
      setLastFetch(new Date(lastFetch));
    } else {
      fetchContextForThemes(themes);
    }
    // Only run when projectId or themes content changes
    // eslint-disable-next-line
  }, [projectId, JSON.stringify(themes)]);

  return (
    <div className="w-full max-w-5xl mx-auto py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
        <h2 className="text-1l font-bold">Contextualization</h2>
        <div className="flex items-center gap-2">
          {lastFetch && (
            <Badge variant="outline" className="text-xs">
              Last fetched: {lastFetch.toLocaleString()}
            </Badge>
          )}
          <Button
            onClick={() => fetchContextForThemes(themes)}
            disabled={loading}
            className="cursor-pointer "
          >
            {loading ? "Fetching..." : "Re-fetch Context"}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!themes || themes.length === 0 ? (
        <p className="text-gray-500 text-center">No themes to contextualize.</p>
      ) : loading ? (
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ) : contextualData.length === 0 ? (
        <p className="text-gray-500 text-center">No context found yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contextualData.map((item, idx) => (
            <Card
              key={idx}
              className="flex flex-col h-full border-pastel-pink/60 border shadow-xl animate-fade-in-up transition-shadow hover:shadow-2xl"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-pastel-pink/30 text-black">{`Theme ${idx + 1}`}</Badge>
                  <CardTitle className="text-lg">{item.theme}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed mb-2">
                  {item.context}
                </p>
              </CardContent>
              <CardFooter className="mt-auto flex justify-end">
                <a
                  href={`https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(item.theme)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-pastel-pink hover:underline text-xs"
                  title={`Learn more about ${item.theme}`}
                >
                  Learn more <ExternalLink className="w-3 h-3" />
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <div className="text-xs text-gray-400 mt-8 text-center">
        Contexts provided by <a href="https://www.tavily.com/" target="_blank" rel="noopener noreferrer" className="underline">Tavily API</a>. For deeper reading, see <a href="https://en.wikipedia.org/wiki/Special:Search?search=thematic+analysis" target="_blank" rel="noopener noreferrer" className="underline">thematic analysis</a>.
      </div>
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
