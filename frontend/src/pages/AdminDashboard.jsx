import { AlertTriangle, ClipboardList, FileText, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import StatCard from "../components/StatCard";
import api from "../services/api";

const emptyExam = { title: "", description: "", duration_minutes: 30, max_warnings: 5, is_active: true };
const emptyQuestion = { exam_id: "", text: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_option: "A", marks: 1 };

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [logs, setLogs] = useState([]);
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [examForm, setExamForm] = useState(emptyExam);
  const [questionForm, setQuestionForm] = useState(emptyQuestion);

  const load = () => {
    Promise.all([api.get("/admin/overview"), api.get("/admin/cheating-logs"), api.get("/admin/results"), api.get("/exams")]).then(
      ([overviewRes, logRes, resultRes, examRes]) => {
        setOverview(overviewRes.data);
        setLogs(logRes.data.logs);
        setResults(resultRes.data.results);
        setExams(examRes.data.exams);
      },
    );
  };

  useEffect(load, []);

  const createExam = async (event) => {
    event.preventDefault();
    await api.post("/admin/exams", examForm);
    toast.success("Exam created");
    setExamForm(emptyExam);
    load();
  };

  const addQuestion = async (event) => {
    event.preventDefault();
    await api.post(`/admin/exams/${questionForm.exam_id}/questions`, questionForm);
    toast.success("Question added");
    setQuestionForm(emptyQuestion);
    load();
  };

  const chartData = [
    { name: "Results", value: overview?.counts?.results || 0, fill: "#059669" },
    { name: "Warnings", value: overview?.counts?.warnings || 0, fill: "#f59e0b" },
    { name: "Logs", value: overview?.counts?.cheating_logs || 0, fill: "#e11d48" },
  ];

  if (!overview) return <div>Loading admin dashboard...</div>;

  return (
    <div className="space-y-8">
      <section className="auth-panel rounded-2xl p-7 text-white shadow-soft">
        <div className="relative z-10">
        <p className="text-sm font-semibold text-emerald-300">Admin panel</p>
        <h1 className="mt-1 text-3xl font-bold">Monitoring and exam control center</h1>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        <StatCard label="Students" value={overview.counts.students} icon={Users} tone="blue" />
        <StatCard label="Exams" value={overview.counts.exams} icon={FileText} />
        <StatCard label="Results" value={overview.counts.results} icon={ClipboardList} tone="emerald" />
        <StatCard label="Warnings" value={overview.counts.warnings} icon={AlertTriangle} tone="amber" />
        <StatCard label="Logs" value={overview.counts.cheating_logs} icon={AlertTriangle} tone="rose" />
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-xl font-bold">Exam analytics</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95}>
                  {chartData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <form onSubmit={createExam} className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-bold">Create exam</h2>
            <input className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" placeholder="Title" value={examForm.title} onChange={(e) => setExamForm({ ...examForm, title: e.target.value })} />
            <textarea className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" placeholder="Description" value={examForm.description} onChange={(e) => setExamForm({ ...examForm, description: e.target.value })} />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <input type="number" className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" value={examForm.duration_minutes} onChange={(e) => setExamForm({ ...examForm, duration_minutes: Number(e.target.value) })} />
              <input type="number" className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" value={examForm.max_warnings} onChange={(e) => setExamForm({ ...examForm, max_warnings: Number(e.target.value) })} />
            </div>
            <button className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white">Create</button>
          </form>

          <form onSubmit={addQuestion} className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-bold">Add question</h2>
            <select className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" value={questionForm.exam_id} onChange={(e) => setQuestionForm({ ...questionForm, exam_id: e.target.value })}>
              <option value="">Select exam</option>
              {exams.map((exam) => <option key={exam.id} value={exam.id}>{exam.title}</option>)}
            </select>
            <textarea className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" placeholder="Question" value={questionForm.text} onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })} />
            {["a", "b", "c", "d"].map((letter) => (
              <input key={letter} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" placeholder={`Option ${letter.toUpperCase()}`} value={questionForm[`option_${letter}`]} onChange={(e) => setQuestionForm({ ...questionForm, [`option_${letter}`]: e.target.value })} />
            ))}
            <select className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" value={questionForm.correct_option} onChange={(e) => setQuestionForm({ ...questionForm, correct_option: e.target.value })}>
              {["A", "B", "C", "D"].map((option) => <option key={option}>{option}</option>)}
            </select>
            <button className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white dark:bg-white dark:text-slate-900">Add question</button>
          </form>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-xl font-bold">Student results</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-500"><tr><th className="py-2">Student</th><th>Exam</th><th>Score</th><th>Submitted</th></tr></thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.id} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="py-3">{result.user?.name}</td><td>{result.exam?.title}</td><td>{result.percentage}%</td><td>{new Date(result.submitted_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-xl font-bold">Cheating reports</h2>
          <div className="max-h-[430px] space-y-3 overflow-auto">
            {logs.map((log) => (
              <div key={log.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{log.event_type}</p>
                    <p className="text-sm text-slate-500">{log.description}</p>
                    <p className="mt-1 text-xs text-slate-400">{new Date(log.created_at).toLocaleString()}</p>
                  </div>
                  <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{Math.round(log.confidence * 100)}%</span>
                </div>
                {log.screenshot_url && (
                  <img className="mt-3 aspect-video w-full rounded-lg object-cover" src={`http://localhost:5000${log.screenshot_url}`} alt="Captured suspicious activity" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
