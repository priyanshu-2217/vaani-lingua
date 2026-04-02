export interface Profile {
  id: string;
  full_name: string;
  preferred_language: string;
  total_transcriptions: number;
  total_audio_minutes: number;
  created_at: string;
}

export interface Transcription {
  id: string;
  user_id: string;
  title: string;
  content: string;
  language: string;
  word_count: number;
  duration_seconds: number;
  source: "live" | "upload";
  audio_url: string | null;
  noise_cleaned: boolean;
  created_at: string;
}
