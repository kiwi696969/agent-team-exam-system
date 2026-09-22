#!/usr/bin/env node
// 在线考试系统 — 后端 API（Node 原生 http，零依赖）
// 提供：登录、题库、考试、答题、阅卷（自动判分）、成绩统计
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

const PORT = process.env.PORT || 3000;

// ---------- 内存数据 ----------
let questions = [
  { id: 1, subjectId: 1, type: "single", content: "下列哪种排序算法平均时间复杂度为 O(n log n)？", options: ["冒泡排序", "快速排序", "选择排序", "插入排序"], answer: "B", difficulty: 2 },
  { id: 2, subjectId: 1, type: "judge", content: "HTTP 是无状态协议。", options: ["正确", "错误"], answer: "A", difficulty: 1 },
  { id: 3, subjectId: 2, type: "multiple", content: "下列属于线性数据结构的有：", options: ["数组", "栈", "队列", "二叉树"], answer: "ABC", difficulty: 3 },
  { id: 4, subjectId: 1, type: "blank", content: "进程间通信的常用方式有___、消息队列、共享内存、Socket。", answer: "管道", difficulty: 3 },
  { id: 5, subjectId: 2, type: "essay", content: "简述数据库事务的 ACID 特性。", answer: "", difficulty: 4 },
];
let attempts = [];

// ---------- 工具 ----------
function json(res, code, data) {
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS", "Access-Control-Allow-Headers": "Content-Type,Authorization" });
  res.end(JSON.stringify(data));
}
function readBody(req) {
  return new Promise((resolve) => {
    let d = "";
    req.on("data", (c) => (d += c));
    req.on("end", () => { try { resolve(JSON.parse(d || "{}")); } catch { resolve({}); } });
  });
}
// 客观题判分
function gradeAnswer(q, answer) {
  if (["single", "judge"].includes(q.type)) return String(answer || "").trim().toUpperCase() === String(q.answer).trim().toUpperCase();
  if (q.type === "multiple") return String(answer || "").trim().toUpperCase().split("").sort().join("") === String(q.answer).trim().toUpperCase().split("").sort().join("");
  if (q.type === "blank") return String(answer || "").trim() === String(q.answer).trim();
  return null; // essay 人工
}

// ---------- 路由 ----------
const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  if (req.method === "OPTIONS") return json(res, 204, {});

  // 认证（简化）：POST /api/auth/login 返回 token
  if (req.method === "POST" && path === "/api/auth/login") {
    const body = await readBody(req);
    if (body.username && body.password) return json(res, 200, { token: randomUUID(), role: "student", username: body.username });
    return json(res, 401, { error: "用户名或密码错误" });
  }

  // 题库
  if (req.method === "GET" && path === "/api/questions") return json(res, 200, { data: questions });
  if (req.method === "POST" && path === "/api/questions") {
    const body = await readBody(req);
    const q = { id: questions.length + 1, ...body };
    questions.push(q);
    return json(res, 201, { data: q });
  }

  // 创建考试（组卷，简化：从题库抽前 N 题）
  if (req.method === "POST" && path === "/api/exams") {
    const body = await readBody(req);
    const picked = questions.filter((q) => q.type !== "essay").slice(0, 4);
    const exam = { id: Math.floor(Math.random() * 10000), title: body.title || "期中考试", duration: 60, totalScore: 100, questions: picked, createdBy: body.teacherId };
    return json(res, 201, { data: exam });
  }

  // 开始考试
  const mStart = path.match(/^\/api\/exams\/(\d+)\/start$/);
  if (req.method === "POST" && mStart) {
    const attempt = { id: attempts.length + 1, examId: Number(mStart[1]), status: "ongoing", startedAt: new Date().toISOString(), score: 0, answers: {} };
    attempts.push(attempt);
    return json(res, 201, { data: attempt });
  }

  // 交卷（自动判分客观题）
  const mSubmit = path.match(/^\/api\/attempts\/(\d+)\/submit$/);
  if (req.method === "POST" && mSubmit) {
    const body = await readBody(req);
    const attempt = attempts.find((a) => a.id === Number(mSubmit[1]));
    if (!attempt) return json(res, 404, { error: "答卷不存在" });
    const examQuestions = questions.filter((q) => q.type !== "essay").slice(0, 4);
    let score = 0;
    const detail = examQuestions.map((q) => {
      const ans = (body.answers || {})[q.id];
      const correct = gradeAnswer(q, ans);
      if (correct === true) score += 100 / examQuestions.length;
      return { questionId: q.id, answer: ans || "", correct, score: correct === true ? 100 / examQuestions.length : 0 };
    });
    attempt.status = "submitted";
    attempt.score = Math.round(score * 100) / 100;
    attempt.detail = detail;
    return json(res, 200, { data: { attemptId: attempt.id, score: attempt.score, detail } });
  }

  // 成绩统计
  if (req.method === "GET" && path === "/api/stats/overview") {
    const scores = attempts.filter((a) => a.status !== "ongoing").map((a) => a.score);
    const avg = scores.length ? scores.reduce((s, x) => s + x, 0) / scores.length : 0;
    const pass = scores.filter((s) => s >= 60).length;
    return json(res, 200, { data: { total: scores.length, avg: Math.round(avg * 100) / 100, passRate: scores.length ? Math.round((pass / scores.length) * 10000) / 100 : 0 } });
  }

  json(res, 404, { error: "接口不存在" });
});

server.listen(PORT, () => console.log(`在线考试系统 API 已启动：http://127.0.0.1:${PORT}`));