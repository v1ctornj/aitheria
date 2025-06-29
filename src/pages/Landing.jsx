import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { CheckCircle, Folder, Brain, Lock } from "lucide-react"
import "@fontsource/montserrat/400.css"
import "@fontsource/montserrat/700.css"

export default function Landing() {
  const navigate = useNavigate()

  // Define icon colors for each card
  const iconColors = [
    "text-orange-700",      // For Researchers
    "text-blue-300",        // Project Workspace
    "text-green-300",       // AI Thematic Analysis
    "text-yellow-300",      // Secure & Private
  ]

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative bg-black overflow-hidden"
      style={{ fontFamily: "'Montserrat', Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif" }}
    >
      <main className="relative z-10 flex flex-col items-center justify-center px-4 w-full">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center py-24 w-full">
          <h1
            className="text-5xl md:text-7xl font-extrabold mb-6 text-center tracking-tight leading-tight font-[Montserrat] professional-title"
            style={{ letterSpacing: "-0.03em" }}
          >
            <span className="block">
              <span className="subtle-glow text-yellow-200">Ai</span>
              <span className="text-white">theria</span>
            </span>
            <span className="block text-xl md:text-2xl font-normal text-white/70 mt-2 tracking-normal font-[Montserrat]">
              Fieldwork, Reimagined.
            </span>
            <br />
          </h1>
          <p className="text-lg md:text-2xl text-white/80 mb-12 text-center max-w-2xl font-light tracking-tight font-[Montserrat]">
            The modern workspace for qualitative research. <br />Minimal, beautiful, and focused on what matters.
          </p>
          <Button
            size="lg"
            className="bg-white text-black hover:bg-pastel-pink hover:text-white transition-colors font-medium shadow-lg rounded-full px-8 py-6 text-lg border border-black font-[Montserrat]"
            onClick={() => navigate("/login")}
          >
            Get Started
          </Button>
        </section>

        {/* Features Section */}
        <section className="w-full max-w-5xl mx-auto mt-10 mb-24">
          <h2 className="text-2xl md:text-3xl font-semibold text-white text-center mb-12 tracking-tight font-[Montserrat]">
            Why Aitheria?
          </h2>
          <div className="grid gap-8 md:grid-cols-4">
            <FeatureCard
              icon={<CheckCircle className={`w-8 h-8 ${iconColors[0]}`} />}
              title="For Researchers"
              description="Purpose-built for managing qualitative field interviews and data."
            />
            <FeatureCard
              icon={<Folder className={`w-8 h-8 ${iconColors[1]}`} />}
              title="Project Workspace"
              description="Create projects, track visits, and manage interviews in one place."
            />
            <FeatureCard
              icon={<Brain className={`w-8 h-8 ${iconColors[2]}`} />}
              title="AI Thematic Analysis"
              description="Transcribe and surface recurring themes, keywords, and patterns."
            />
            <FeatureCard
              icon={<Lock className={`w-8 h-8 ${iconColors[3]}`} />}
              title="Secure & Private"
              description="Powered by Appwrite. Your data stays yours, always encrypted, always safe."
            />
          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full max-w-2xl mx-auto mb-24">
          <blockquote className="italic text-white/80 text-center text-lg md:text-xl mb-8 font-light font-[Montserrat]">
            “There is no greater agony than bearing an untold story inside you.”
          </blockquote>
          <div className="flex justify-center">
            <Button
              size="lg"
              className="bg-pastel-pink text-black hover:bg-white hover:text-pastel-pink transition-colors font-medium shadow-lg rounded-full px-8 py-6 text-lg border border-black font-[Montserrat]"
              onClick={() => navigate("/login")}
            >
              Get Started
            </Button>
          </div>
        </section>
      </main>
      <style>{`
        .professional-title {
          text-shadow:
            0 0 8px #ffe06644,
            0 2px 4px rgba(0,0,0,0.12);
        }
        .subtle-glow {
          text-shadow:
            0 0 6px #ffe06688,
            0 1px 2px rgba(0,0,0,0.10);
        }
        .font-[Montserrat], body {
          font-family: 'Montserrat', Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif !important;
        }
      `}</style>
    </div>
  )
}

// FeatureCard component with subtle Apple-like hover animation and minimalism
function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white/5 rounded-2xl p-8 flex flex-col items-center gap-4 shadow-sm border border-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:bg-white/10 cursor-pointer font-[Montserrat]">
      <div>{icon}</div>
      <h4 className="text-base font-semibold text-white text-center tracking-tight">{title}</h4>
      <p className="text-white/70 text-sm text-center font-light">{description}</p>
    </div>
  )
}