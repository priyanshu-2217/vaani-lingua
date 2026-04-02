import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/layout/Footer";
import {
  Mic, Upload, Sparkles, Languages, Download, History,
  ArrowRight, Volume2, FileText, Zap, Shield
} from "lucide-react";
import { INDIAN_LANGUAGES } from "@/lib/languages";

const features = [
  { icon: Mic, title: "Live Transcription", desc: "Real-time speech-to-text with waveform visualization" },
  { icon: Upload, title: "File Upload", desc: "Upload MP3, WAV, MP4 and more for batch transcription" },
  { icon: Volume2, title: "Noise Cleaning", desc: "Built-in noise reduction for crystal-clear transcripts" },
  { icon: Languages, title: "13 Indian Languages", desc: "Hindi, Tamil, Bengali, Telugu and 9 more languages" },
  { icon: Download, title: "Export Formats", desc: "Download transcripts as .txt or .pdf with metadata" },
  { icon: History, title: "History & Analytics", desc: "Track all transcriptions with search and filters" },
];

const steps = [
  { num: "01", title: "Upload or Speak", desc: "Record live audio or upload a file in any supported format", icon: Mic },
  { num: "02", title: "AI Transcribes", desc: "Our engine processes your audio with noise reduction", icon: Sparkles },
  { num: "03", title: "Download Clean Text", desc: "Get your transcript as editable text, TXT or PDF", icon: FileText },
];

const stats = [
  { value: "13", label: "Languages Supported" },
  { value: "99%", label: "Accuracy Rate" },
  { value: "Built-in", label: "Noise Reduction" },
  { value: "2", label: "Export Formats" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 hero-gradient opacity-5" />
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-accent" />
              Powered by AI • 13 Indian Languages
            </div>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground md:text-6xl lg:text-7xl">
              Transcribe Indian Languages{" "}
              <span className="text-gradient">Instantly</span>
            </h1>
            <p className="mb-10 text-lg text-muted-foreground md:text-xl">
              Live or uploaded audio → clean text in seconds. Support for Hindi, Tamil, Bengali, Telugu and 9 more Indian languages with built-in noise reduction.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to="/auth">
                <Button size="lg" className="glow-primary px-8 text-base">
                  Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg" className="px-8 text-base">
                  See Features
                </Button>
              </a>
            </div>
          </div>

          {/* Floating waveform decoration */}
          <div className="mt-16 flex items-end justify-center gap-1">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="w-1 rounded-full bg-primary/20 animate-waveform"
                style={{
                  animationDelay: `${i * 0.05}s`,
                  height: `${Math.random() * 40 + 8}px`,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Languages */}
      <section className="border-y border-border bg-card/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground">Supported Languages</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {INDIAN_LANGUAGES.map((lang) => (
              <div
                key={lang.code}
                className="card-gradient rounded-xl border border-border px-5 py-3 text-center transition-all hover:glow-primary"
              >
                <p className="text-sm font-semibold text-foreground">{lang.name}</p>
                <p className="text-xs text-muted-foreground">{lang.nativeName}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground">Everything You Need</h2>
            <p className="text-muted-foreground">Powerful features for accurate Indian language transcription</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="card-gradient border-border transition-all hover:glow-primary">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-border bg-card/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <s.icon className="h-8 w-8 text-primary" />
                </div>
                <span className="mb-2 text-sm font-bold text-accent">{s.num}</span>
                <h3 className="mb-2 text-xl font-semibold text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-extrabold text-gradient">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-2xl rounded-2xl hero-gradient p-12">
            <h2 className="mb-4 text-3xl font-bold text-primary-foreground">Ready to Transcribe?</h2>
            <p className="mb-8 text-primary-foreground/80">Start transcribing Indian languages in seconds — no setup required.</p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="px-8 text-base font-semibold">
                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
