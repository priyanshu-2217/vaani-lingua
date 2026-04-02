import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { INDIAN_LANGUAGES } from "@/lib/languages";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import WaveformVisualizer from "./WaveformVisualizer";
import { downloadAsTxt, downloadAsPdf } from "@/lib/pdfExport";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Mic, MicOff, Pause, Play, Square, Save, Download, FileText, Trash2, AlertTriangle, Copy } from "lucide-react";

export default function LiveTranscription() {
  const { user, profile } = useAuth();
  const [language, setLanguage] = useState(profile?.preferred_language || "Hindi");
  const [noiseReduction, setNoiseReduction] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState("");
  const [showEditor, setShowEditor] = useState(false);

  const speech = useSpeechRecognition();
  const recorder = useAudioRecorder();

  useEffect(() => {
    if (profile?.preferred_language) setLanguage(profile.preferred_language);
  }, [profile]);

  useEffect(() => {
    if (!speech.isListening && speech.fullTranscript) {
      setEditedTranscript(speech.fullTranscript.trim());
      setShowEditor(true);
    }
  }, [speech.isListening, speech.fullTranscript]);

  if (!speech.isSupported) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-accent" />
        <h3 className="text-lg font-semibold text-foreground">Browser Not Supported</h3>
        <p className="text-sm text-muted-foreground">Please use Chrome or Edge for live transcription.</p>
      </div>
    );
  }

  const handleStart = () => {
    speech.start(language);
    recorder.startRecording(noiseReduction);
  };

  const handlePause = () => {
    speech.pause();
  };

  const handleResume = () => {
    speech.resume(language);
  };

  const handleStop = () => {
    speech.stop();
    recorder.stopRecording();
  };

  const handleClear = () => {
    speech.reset();
    setEditedTranscript("");
    setShowEditor(false);
  };

  const handleSave = async () => {
    if (!editedTranscript.trim() || !user) return;
    const wordCount = editedTranscript.split(/\s+/).filter(Boolean).length;
    const title = editedTranscript.split(/\s+/).slice(0, 5).join(" ") + "...";

    const { error } = await supabase.from("transcriptions").insert({
      user_id: user.id,
      title,
      content: editedTranscript,
      language,
      word_count: wordCount,
      duration_seconds: recorder.duration,
      source: "live" as const,
      noise_cleaned: noiseReduction,
    });

    if (error) {
      toast.error("Failed to save transcript");
    } else {
      toast.success("Transcript saved! ✓");
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const avgConfidence = speech.results.length
    ? Math.round(speech.results.reduce((a, r) => a + r.confidence, 0) / speech.results.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Language & Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="min-w-[200px]">
          <Label className="mb-1 block text-sm">Language</Label>
          <Select value={language} onValueChange={setLanguage} disabled={speech.isListening}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {INDIAN_LANGUAGES.map((l) => (
                <SelectItem key={l.code} value={l.name}>{l.name} ({l.nativeName})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={noiseReduction} onCheckedChange={setNoiseReduction} disabled={speech.isListening} />
          <Label className="text-sm">Noise Reduction</Label>
        </div>
      </div>

      {/* Waveform */}
      <WaveformVisualizer data={recorder.analyserData} isActive={recorder.isRecording} />

      {/* Recording controls */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {!speech.isListening ? (
          <Button onClick={handleStart} size="lg" className="glow-primary gap-2">
            <Mic className="h-5 w-5" /> Start Recording
          </Button>
        ) : (
          <>
            {speech.isPaused ? (
              <Button onClick={handleResume} variant="outline" size="lg" className="gap-2">
                <Play className="h-5 w-5" /> Resume
              </Button>
            ) : (
              <Button onClick={handlePause} variant="outline" size="lg" className="gap-2">
                <Pause className="h-5 w-5" /> Pause
              </Button>
            )}
            <Button onClick={handleStop} variant="destructive" size="lg" className="gap-2">
              <Square className="h-5 w-5" /> Stop
            </Button>
          </>
        )}
      </div>

      {/* Status */}
      {speech.isListening && (
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
            {speech.isPaused ? "Paused" : "Recording..."}
          </span>
          <span>⏱ {formatTime(recorder.duration)}</span>
          {avgConfidence > 0 && <span>Confidence: {avgConfidence}%</span>}
        </div>
      )}

      {/* Live transcript */}
      {(speech.fullTranscript || speech.isListening) && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-foreground">
            {speech.results.map((r, i) => (
              <span key={i}>{r.transcript} </span>
            ))}
            {speech.interimTranscript && (
              <span className="text-muted-foreground italic">{speech.interimTranscript}</span>
            )}
          </p>
        </div>
      )}

      {/* Editor & Actions */}
      {showEditor && (
        <div className="space-y-4">
          <Label>Edit Transcript</Label>
          <Textarea
            value={editedTranscript}
            onChange={(e) => setEditedTranscript(e.target.value)}
            rows={8}
            className="resize-y"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{editedTranscript.split(/\s+/).filter(Boolean).length} words · {editedTranscript.length} chars</span>
            <span>Duration: {formatTime(recorder.duration)}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSave} className="gap-1"><Save className="h-4 w-4" /> Save</Button>
            <Button variant="outline" onClick={() => downloadAsTxt(editedTranscript, `transcript_${language}_${new Date().toISOString().slice(0, 10)}.txt`)} className="gap-1">
              <Download className="h-4 w-4" /> .txt
            </Button>
            <Button variant="outline" onClick={() => downloadAsPdf(editedTranscript, language, recorder.duration, `transcript_${language}_${new Date().toISOString().slice(0, 10)}.pdf`)} className="gap-1">
              <FileText className="h-4 w-4" /> .pdf
            </Button>
            <Button variant="outline" onClick={() => { navigator.clipboard.writeText(editedTranscript); toast.success("Copied!"); }} className="gap-1">
              <Copy className="h-4 w-4" /> Copy
            </Button>
            <Button variant="ghost" onClick={handleClear} className="gap-1 text-destructive">
              <Trash2 className="h-4 w-4" /> Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
