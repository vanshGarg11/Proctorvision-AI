import { AlertTriangle, CheckCircle2, Clock, Maximize2 } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

import WarningPopup from "../components/WarningPopup";
import WebcamMonitor from "../components/WebcamMonitor";
import api from "../services/api";

export default function ExamPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    api.get(`/exams/${examId}`).then((res) => {
      setExam(res.data.exam);
      setSecondsLeft(res.data.exam.duration_minutes * 60);
    });
  }, [examId]);

  const submitExam = useCallback(
    async (auto = false) => {
      if (submitted) return;
      setSubmitted(true);
      const res = await api.post(`/exams/${examId}/submit`, { answers, auto_submitted: auto });
      toast.success(auto ? "Exam auto-submitted" : "Exam submitted");
      navigate("/dashboard", { state: { result: res.data.result } });
    },
    [answers, examId, navigate, submitted],
  );

  const recordBrowserEvent = useCallback(
    async (event_type, message) => {
      if (!started || submitted) return;
      const res = await api.post("/proctor/event", { exam_id: Number(examId), event_type, message, confidence: 0.95 });
      setWarningCount(res.data.warning_count);
      setPopup(res.data.warning);
      toast.error(message);
      if (res.data.should_auto_submit) submitExam(true);
    },
    [examId, started, submitted, submitExam],
  );

  useEffect(() => {
    if (!started || submitted) return undefined;
    const timer = setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          clearInterval(timer);
          submitExam(true);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started, submitted, submitExam]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) recordBrowserEvent("TAB_SWITCH", "Tab switch or browser minimize detected.");
    };
    const onBlur = () => recordBrowserEvent("WINDOW_BLUR", "Exam window lost focus.");
    const onFullscreen = () => {
      if (started && !document.fullscreenElement) recordBrowserEvent("FULLSCREEN_EXIT", "Fullscreen mode was exited.");
    };
    const onContext = (event) => event.preventDefault();
    const onKey = (event) => {
      const key = event.key.toLowerCase();
      if ((event.ctrlKey && ["c", "v", "x", "a", "p", "s", "u"].includes(key)) || key === "f12") {
        event.preventDefault();
        recordBrowserEvent("RESTRICTED_KEY", "Restricted shortcut attempted.");
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    document.addEventListener("fullscreenchange", onFullscreen);
    document.addEventListener("contextmenu", onContext);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("fullscreenchange", onFullscreen);
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("keydown", onKey);
    };
  }, [recordBrowserEvent, started]);

  const timeText = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
    const seconds = (secondsLeft % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [secondsLeft]);

  const startExam = async () => {
    await document.documentElement.requestFullscreen?.();
    setStarted(true);
  };

  const handleWarning = useCallback(
    (data) => {
      setWarningCount(data.warning_count);
      setPopup(data.warning);
      if (data.should_auto_submit) submitExam(true);
    },
    [submitExam],
  );

  if (!exam) return <div className="grid min-h-screen place-items-center bg-slate-950 text-white">Loading exam...</div>;

  if (!started) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 px-6 text-white">
        <div className="max-w-2xl rounded-lg border border-slate-800 bg-slate-900 p-8 shadow-soft">
          <h1 className="text-3xl font-bold">{exam.title}</h1>
          <p className="mt-3 text-slate-300">{exam.description}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-800 p-4"><Clock size={20} /><p className="mt-2 font-semibold">{exam.duration_minutes} minutes</p></div>
            <div className="rounded-lg bg-slate-800 p-4"><AlertTriangle size={20} /><p className="mt-2 font-semibold">{exam.max_warnings} warnings max</p></div>
            <div className="rounded-lg bg-slate-800 p-4"><Maximize2 size={20} /><p className="mt-2 font-semibold">Fullscreen required</p></div>
          </div>
          <button onClick={startExam} className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 font-semibold hover:bg-emerald-700">
            <CheckCircle2 size={18} />
            Enter fullscreen and start
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <WarningPopup warning={popup} onClose={() => setPopup(null)} />
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1fr_340px]">
        <main className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div>
              <h1 className="text-2xl font-bold">{exam.title}</h1>
              <p className="text-sm text-slate-500">{exam.questions.length} questions</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-slate-100 px-4 py-2 font-mono text-lg font-bold dark:bg-slate-800">{timeText}</span>
              <span className="rounded-lg bg-amber-50 px-4 py-2 font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                {warningCount}/{exam.max_warnings}
              </span>
            </div>
          </div>
          <div className="space-y-6">
            {exam.questions.map((question, index) => (
              <div key={question.id} className="rounded-lg border border-slate-200 p-5 dark:border-slate-800">
                <p className="font-semibold">{index + 1}. {question.text}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {Object.entries(question.options).map(([key, value]) => (
                    <label key={key} className={`cursor-pointer rounded-lg border p-3 transition ${answers[question.id] === key ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" : "border-slate-200 dark:border-slate-800"}`}>
                      <input className="mr-2" type="radio" name={`q-${question.id}`} checked={answers[question.id] === key} onChange={() => setAnswers({ ...answers, [question.id]: key })} />
                      <span className="font-semibold">{key}.</span> {value}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => submitExam(false)} className="mt-6 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700">
            Submit exam
          </button>
        </main>
        <aside className="space-y-5">
          <WebcamMonitor examId={Number(examId)} onWarning={handleWarning} paused={submitted} />
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="font-semibold">Security status</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <p>Fullscreen monitoring active</p>
              <p>Tab switching detection active</p>
              <p>Right click and copy-paste blocked</p>
              <p>Auto-submit after maximum warnings</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
