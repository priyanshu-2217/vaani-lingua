import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { INDIAN_LANGUAGES } from "@/lib/languages";
import { downloadAsTxt, downloadAsPdf } from "@/lib/pdfExport";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Volume2, Save, Download, FileText, Copy, RefreshCw, Trash2, File } from "lucide-react";

const ACCEPTED = ".mp3,.mp4,.wav,.ogg,.m4a,.webm,.flac";
const MAX_SIZE = 100 * 1024 * 1024;

export default function FileUpload() {
  const { user, profile } = useAuth();
  const [language, setLanguage] = useState(profile?.preferred_language || "Hindi");
  const [noiseReduction, setNoiseReduction] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile?.preferred_language) setLanguage(profile.preferred_language);
  }, [profile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) validateAndSet(f);
  }, []);

  const validateAndSet = (f: File) => {
    if (f.size > MAX_SIZE) {
      toast.error("File too large. Maximum size is 100MB.");
      return;
    }
    setFile(f);
    setTranscript("");
    setProgress(0);
    setStage("");
  };

  const handleTranscribe = async () => {
    if (!file) return;
    setIsProcessing(true);

    // Simulate transcription stages (in production, use AssemblyAI/Whisper API)
    setStage("Uploading audio...");
    setProgress(20);
    await new Promise((r) => setTimeout(r, 1000));

    // Upload to Supabase Storage
    if (user) {
      const path = `${user.id}/${Date.now()}_${file.name}`;
      await supabase.storage.from("audio-files").upload(path, file);
    }

    const audioPath = `${user!.id}/${Date.now()}_${file.name}`;

    setStage("Uploading audio...");
    setProgress(30);
    const { error: uploadError } = await supabase.storage.from("audio-files").upload(audioPath, file);
    if (uploadError) {
      toast.error("Upload failed: " + uploadError.message);
      setIsProcessing(false);
      return;
    }

    setStage("Transcribing with AI...");
    setProgress(60);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("transcribe-audio", {
        body: { audioPath, language },
      });

      if (fnError) {
        toast.error("Transcription failed: " + fnError.message);
        setIsProcessing(false);
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        setIsProcessing(false);
        return;
      }

      setTranscript(data.transcript);
      setProgress(100);
      setStage("Complete!");
      setIsProcessing(false);
      toast.success("Transcription complete! ✓");
    } catch (err: any) {
      toast.error("Transcription failed: " + (err.message || "Unknown error"));
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!transcript.trim() || !user) return;
    const wordCount = transcript.split(/\s+/).filter(Boolean).length;
    const title = transcript.split(/\s+/).slice(0, 5).join(" ") + "...";

    const { error } = await supabase.from("transcriptions").insert({
      user_id: user.id,
      title,
      content: transcript,
      language,
      word_count: wordCount,
      duration_seconds: 0,
      source: "upload",
      noise_cleaned: noiseReduction,
    });

    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      // Update profile stats
      await supabase.from("profiles").update({
        total_transcriptions: (profile?.total_transcriptions ?? 0) + 1,
      }).eq("id", user.id);
      toast.success("Saved! ✓");
    }
  };

  const wordCount = transcript.split(/\s+/).filter(Boolean).length;
  const charCount = transcript.length;

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 transition-colors hover:border-primary/50 hover:bg-muted/50"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && validateAndSet(e.target.files[0])}
        />
        {file ? (
          <div className="flex items-center gap-3">
            <File className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium text-foreground">{file.name}</p>
              <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setFile(null); setTranscript(""); }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Drop audio file or click to upload</p>
            <p className="text-xs text-muted-foreground">MP3, WAV, MP4, OGG, M4A, WebM, FLAC — Max 100MB</p>
          </>
        )}
      </div>

      {/* Options */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="min-w-[200px]">
          <Label className="mb-1 block text-sm">Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {INDIAN_LANGUAGES.map((l) => (
                <SelectItem key={l.code} value={l.name}>{l.name} ({l.nativeName})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={noiseReduction} onCheckedChange={setNoiseReduction} />
          <Label className="text-sm">Noise Reduction</Label>
        </div>
        {noiseReduction && (
          <span className="flex items-center gap-1 text-xs text-accent">
            <Volume2 className="h-3 w-3" /> Noise reduction will be applied
          </span>
        )}
      </div>

      {/* Transcribe Button */}
      {file && !transcript && (
        <Button onClick={handleTranscribe} disabled={isProcessing} size="lg" className="w-full glow-primary">
          {isProcessing ? "Processing..." : "Transcribe Now"}
        </Button>
      )}

      {/* Progress */}
      {isProcessing && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-center text-sm text-muted-foreground">{stage} {progress}%</p>
        </div>
      )}

      {/* Result */}
      {transcript && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
            {noiseReduction && <span className="text-accent">✓ Noise reduced</span>}
          </div>
          <Textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} rows={10} className="resize-y" />
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSave} className="gap-1"><Save className="h-4 w-4" /> Save</Button>
            <Button variant="outline" onClick={() => downloadAsTxt(transcript, `upload_${language}.txt`)} className="gap-1">
              <Download className="h-4 w-4" /> .txt
            </Button>
            <Button variant="outline" onClick={() => downloadAsPdf(transcript, language, 0, `upload_${language}.pdf`)} className="gap-1">
              <FileText className="h-4 w-4" /> .pdf
            </Button>
            <Button variant="outline" onClick={() => { navigator.clipboard.writeText(transcript); toast.success("Copied!"); }} className="gap-1">
              <Copy className="h-4 w-4" /> Copy
            </Button>
            <Button variant="outline" onClick={handleTranscribe} className="gap-1">
              <RefreshCw className="h-4 w-4" /> Retranscribe
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
