const users = [
  { id: 1, name: "System Admin", email: "admin@proctorvision.local", password: "Admin@123", role: "admin" },
  { id: 2, name: "Demo Student", email: "student@proctorvision.local", password: "Student@123", role: "student" },
];

const exams = [
  {
    id: 1,
    title: "AI Fundamentals Mock Test",
    description: "MCQ test covering AI, ML, and responsible proctoring basics.",
    duration_minutes: 20,
    max_warnings: 5,
    is_active: true,
    created_at: new Date().toISOString(),
    questions: [
      {
        id: 1,
        exam_id: 1,
        text: "Which technique is used here for face detection?",
        options: {
          A: "OpenCV Haar Cascade",
          B: "Blockchain mining",
          C: "SQL indexing",
          D: "CSS animation",
        },
        correct_option: "A",
        marks: 1,
      },
      {
        id: 2,
        exam_id: 1,
        text: "What should happen when the exam timer ends?",
        options: {
          A: "Pause indefinitely",
          B: "Auto-submit the exam",
          C: "Clear all answers",
          D: "Disable the database",
        },
        correct_option: "B",
        marks: 1,
      },
      {
        id: 3,
        exam_id: 1,
        text: "Which browser event helps detect tab switching?",
        options: {
          A: "visibilitychange",
          B: "mouseenter",
          C: "dragstart",
          D: "scroll",
        },
        correct_option: "A",
        marks: 1,
      },
    ],
  },
];

const results = [];
const warnings = [];
const logs = [];

function json(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, ngrok-skip-browser-warning",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    },
    body: JSON.stringify(payload),
  };
}

function parseBody(event) {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch {
    return {};
  }
}

function publicExam(exam, includeQuestions = false, includeAnswers = false) {
  const data = {
    id: exam.id,
    title: exam.title,
    description: exam.description,
    duration_minutes: exam.duration_minutes,
    max_warnings: exam.max_warnings,
    is_active: exam.is_active,
    question_count: exam.questions.length,
    created_at: exam.created_at,
  };
  if (includeQuestions) {
    data.questions = exam.questions.map((question) => {
      const item = { ...question };
      if (!includeAnswers) delete item.correct_option;
      return item;
    });
  }
  return data;
}

function makeToken(user) {
  return Buffer.from(JSON.stringify({ id: user.id, email: user.email, role: user.role })).toString("base64url");
}

function userFromEvent(event) {
  const header = event.headers.authorization || event.headers.Authorization || "";
  const token = header.replace("Bearer ", "");
  if (!token) return null;
  try {
    const payload = JSON.parse(Buffer.from(token, "base64url").toString("utf8"));
    return users.find((user) => user.id === payload.id) || null;
  } catch {
    return null;
  }
}

function safeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: new Date().toISOString(),
  };
}

function requireUser(event) {
  const user = userFromEvent(event);
  if (!user) return { error: json(401, { message: "Authentication required." }) };
  return { user };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});

  const path = event.path.replace(/^\/api\/?/, "").replace(/^\/\.netlify\/functions\/api\/?/, "");
  const method = event.httpMethod;
  const body = parseBody(event);

  if (path === "health" && method === "GET") {
    return json(200, { status: "ok", project: "ProctorVision AI", runtime: "Netlify Functions" });
  }

  if (path === "auth/login" && method === "POST") {
    const user = users.find((item) => item.email === String(body.email || "").toLowerCase() && item.password === body.password);
    if (!user) return json(401, { message: "Invalid email or password." });
    return json(200, { token: makeToken(user), user: safeUser(user) });
  }

  if (path === "auth/signup" && method === "POST") {
    const email = String(body.email || "").toLowerCase();
    if (!body.name || !email || !body.password) return json(400, { message: "Name, email, and password are required." });
    const existing = users.find((item) => item.email === email);
    if (existing) return json(409, { message: "Email already exists." });
    const user = { id: users.length + 1, name: body.name, email, password: body.password, role: "student" };
    users.push(user);
    return json(201, { token: makeToken(user), user: safeUser(user) });
  }

  if (path === "auth/me" && method === "GET") {
    const { user, error } = requireUser(event);
    if (error) return error;
    return json(200, { user: safeUser(user) });
  }

  if (path === "exams" && method === "GET") {
    return json(200, { exams: exams.filter((exam) => exam.is_active).map((exam) => publicExam(exam)) });
  }

  if (path === "exams/results/me" && method === "GET") {
    const { user, error } = requireUser(event);
    if (error) return error;
    return json(200, { results: results.filter((result) => result.user?.id === user.id) });
  }

  if (path === "exams/warnings/me" && method === "GET") {
    const { user, error } = requireUser(event);
    if (error) return error;
    return json(200, { warnings: warnings.filter((warning) => warning.user_id === user.id) });
  }

  const examDetail = path.match(/^exams\/(\d+)$/);
  if (examDetail && method === "GET") {
    const { user, error } = requireUser(event);
    if (error) return error;
    const exam = exams.find((item) => item.id === Number(examDetail[1]));
    if (!exam) return json(404, { message: "Exam not found." });
    return json(200, { exam: publicExam(exam, true, user.role === "admin") });
  }

  const submit = path.match(/^exams\/(\d+)\/submit$/);
  if (submit && method === "POST") {
    const { user, error } = requireUser(event);
    if (error) return error;
    const exam = exams.find((item) => item.id === Number(submit[1]));
    if (!exam) return json(404, { message: "Exam not found." });
    const answers = body.answers || {};
    const total_marks = exam.questions.reduce((sum, question) => sum + question.marks, 0);
    const score = exam.questions.reduce((sum, question) => sum + (answers[String(question.id)] === question.correct_option ? question.marks : 0), 0);
    const result = {
      id: results.length + 1,
      user: safeUser(user),
      exam: publicExam(exam),
      score,
      total_marks,
      percentage: total_marks ? Math.round((score / total_marks) * 10000) / 100 : 0,
      auto_submitted: Boolean(body.auto_submitted),
      submitted_at: new Date().toISOString(),
    };
    results.push(result);
    return json(200, { message: "Exam submitted.", result });
  }

  if (path === "proctor/analyze-frame" && method === "POST") {
    const { user, error } = requireUser(event);
    if (error) return error;
    return json(200, {
      status: "NORMAL",
      message: "Demo Netlify proctoring endpoint active. Browser activity warnings are still recorded.",
      face_count: 1,
      confidence: 0.91,
      warning: null,
      log: null,
      warning_count: warnings.filter((warning) => warning.user_id === user.id && warning.exam_id === Number(body.exam_id)).length,
      max_warnings: 5,
      should_auto_submit: false,
    });
  }

  if (path === "proctor/event" && method === "POST") {
    const { user, error } = requireUser(event);
    if (error) return error;
    const warning = {
      id: warnings.length + 1,
      user_id: user.id,
      exam_id: Number(body.exam_id),
      warning_type: body.event_type || "UNKNOWN",
      message: body.message || "Suspicious browser activity detected.",
      confidence: Number(body.confidence || 0.9),
      created_at: new Date().toISOString(),
    };
    warnings.push(warning);
    logs.push({
      id: logs.length + 1,
      user_id: user.id,
      exam_id: warning.exam_id,
      event_type: warning.warning_type,
      description: warning.message,
      screenshot_path: null,
      screenshot_url: null,
      confidence: warning.confidence,
      created_at: warning.created_at,
    });
    const warningCount = warnings.filter((item) => item.user_id === user.id && item.exam_id === warning.exam_id).length;
    return json(200, { warning, warning_count: warningCount, max_warnings: 5, should_auto_submit: warningCount >= 5 });
  }

  if (path === "admin/overview" && method === "GET") {
    const { user, error } = requireUser(event);
    if (error) return error;
    if (user.role !== "admin") return json(403, { message: "Admin access required." });
    return json(200, {
      counts: {
        students: users.filter((item) => item.role === "student").length,
        exams: exams.length,
        results: results.length,
        warnings: warnings.length,
        cheating_logs: logs.length,
      },
      recent_warnings: warnings.slice(-10).reverse(),
      recent_results: results.slice(-10).reverse(),
    });
  }

  if (path === "admin/results" && method === "GET") return json(200, { results });
  if (path === "admin/warnings" && method === "GET") return json(200, { warnings });
  if (path === "admin/cheating-logs" && method === "GET") return json(200, { logs });

  return json(404, { message: "Route not found.", path, method });
};
