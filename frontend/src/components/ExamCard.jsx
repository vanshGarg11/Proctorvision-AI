import { Clock, FileText, PlayCircle } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

export default function ExamCard({ exam }) {
  return (
    <div className="hover-lift animate-floatIn rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-bold">{exam.title}</p>
          <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{exam.description}</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
          Active
        </span>
      </div>
      <div className="mt-5 flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-1">
          <Clock size={16} /> {exam.duration_minutes} min
        </span>
        <span className="flex items-center gap-1">
          <FileText size={16} /> {exam.question_count} questions
        </span>
      </div>
      <Link
        to={`/exam/${exam.id}`}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700"
      >
        <PlayCircle size={18} />
        Start Exam
      </Link>
    </div>
  );
}
