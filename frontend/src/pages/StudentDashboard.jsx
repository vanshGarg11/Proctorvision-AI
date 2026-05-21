import { AlertTriangle, BarChart3, FileText, ShieldCheck } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import ExamCard from "../components/ExamCard";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { downloadResultPdf } from "../utils/pdf";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    Promise.all([api.get("/exams"), api.get("/exams/results/me"), api.get("/exams/warnings/me")]).then(
      ([examRes, resultRes, warningRes]) => {
        setExams(examRes.data.exams);
        setResults(resultRes.data.results);
        setWarnings(warningRes.data.warnings);
      },
    );
  }, []);

  const chartData = results.map((result) => ({ name: result.exam?.title?.slice(0, 14) || "Exam", score: result.percentage }));

  return (
    <div className="space-y-8">
      <section className="auth-panel rounded-2xl p-7 text-white shadow-soft">
        <div className="relative z-10">
        <p className="text-sm text-emerald-300">Welcome back</p>
        <h1 className="mt-2 text-3xl font-bold">{user?.name}</h1>
        <p className="mt-2 max-w-3xl text-slate-300">Your exam dashboard shows available tests, previous scores, and proctoring warning history.</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Available exams" value={exams.length} icon={FileText} tone="blue" />
        <StatCard label="Completed" value={results.length} icon={ShieldCheck} />
        <StatCard label="Warnings" value={warnings.length} icon={AlertTriangle} tone="amber" />
        <StatCard label="Avg score" value={`${Math.round(results.reduce((s, r) => s + r.percentage, 0) / (results.length || 1))}%`} icon={BarChart3} tone="rose" />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">Available exams</h2>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {exams.map((exam) => <ExamCard key={exam.id} exam={exam} />)}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-xl font-bold">Performance graph</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-xl font-bold">Exam history</h2>
          <div className="space-y-3">
            {results.map((result) => (
              <div key={result.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                <div>
                  <p className="font-semibold">{result.exam?.title}</p>
                  <p className="text-sm text-slate-500">{result.score}/{result.total_marks} marks</p>
                </div>
                <button onClick={() => downloadResultPdf(result)} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">
                  PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
