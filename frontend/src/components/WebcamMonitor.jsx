import { Camera, ScanFace } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import api from "../services/api";

export default function WebcamMonitor({ examId, onWarning, paused }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("Initializing");
  const [confidence, setConfidence] = useState(0);

  useEffect(() => {
    let stream;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((mediaStream) => {
        stream = mediaStream;
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
        setStatus("Camera active");
      })
      .catch(() => setStatus("Camera permission denied"));

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (paused) return undefined;
    const interval = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || videoRef.current.readyState < 2) return;
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
      const frame = canvas.toDataURL("image/jpeg", 0.7);

      try {
        const res = await api.post("/proctor/analyze-frame", { exam_id: examId, frame });
        setStatus(res.data.status.replaceAll("_", " "));
        setConfidence(res.data.confidence);
        if (res.data.warning) onWarning(res.data);
      } catch {
        setStatus("Analyzer offline");
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [examId, onWarning, paused]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera size={18} className="text-emerald-600" />
          <p className="font-semibold">Live Webcam</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          {Math.round(confidence * 100)}%
        </span>
      </div>
      <div className="scan-card rounded-lg bg-slate-950">
        <video ref={videoRef} autoPlay muted playsInline className="aspect-video w-full rounded-lg object-cover" />
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <ScanFace size={16} />
        <span>{status}</span>
      </div>
    </div>
  );
}
