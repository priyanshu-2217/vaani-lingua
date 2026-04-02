import { useState, useRef, useCallback } from "react";

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [analyserData, setAnalyserData] = useState<number[]>(new Array(32).fill(0));
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const startRecording = useCallback(async (noiseReduction: boolean) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);

      let finalNode: AudioNode = source;

      if (noiseReduction) {
        const highPass = audioContext.createBiquadFilter();
        highPass.type = "highpass";
        highPass.frequency.value = 85;

        const lowPass = audioContext.createBiquadFilter();
        lowPass.type = "lowpass";
        lowPass.frequency.value = 8000;

        const compressor = audioContext.createDynamicsCompressor();
        compressor.threshold.value = -50;
        compressor.knee.value = 40;
        compressor.ratio.value = 12;

        source.connect(highPass);
        highPass.connect(lowPass);
        lowPass.connect(compressor);
        finalNode = compressor;
      }

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      finalNode.connect(analyser);
      analyserRef.current = analyser;

      // Visualizer loop
      const updateVisualizer = () => {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        setAnalyserData(Array.from(data));
        animFrameRef.current = requestAnimationFrame(updateVisualizer);
      };
      updateVisualizer();

      // Duration timer
      setDuration(0);
      intervalRef.current = setInterval(() => setDuration((d) => d + 1), 1000);

      setIsRecording(true);

      // Keep stream reference for cleanup
      mediaRecorderRef.current = new MediaRecorder(stream);
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      mediaRecorderRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    cancelAnimationFrame(animFrameRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRecording(false);
    setAnalyserData(new Array(32).fill(0));
  }, []);

  return { isRecording, duration, analyserData, startRecording, stopRecording };
}
