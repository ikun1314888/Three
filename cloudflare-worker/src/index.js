// 三形连锁棋 · 全局学习聚合 Worker（匿名统计）
// 接口：
//   GET  /profile            -> 全局聚合画像（前端拉取）
//   POST /report             -> 上传一局匿名统计（前端上报）
//   GET  /                   -> 健康检查

const PROFILE_KEY = "profile";
const MAX_THINK_SAMPLES = 400;
const MAX_VALUES = { type: 10000, centerSum: 1e9, thinkMs: 60000 };
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400"
};

export function emptyProfile() {
  return {
    games: 0, wins: 0, losses: 0, draws: 0,
    type: { square: 0, circle: 0, triangle: 0 },
    firstType: { square: 0, circle: 0, triangle: 0 },
    centerSum: 0, centerCount: 0,
    threat: { attack: 0, defense: 0, neutral: 0 },
    thinkMs: []
  };
}

export function mergeReport(p, r) {
  if (!p) p = emptyProfile();
  if (!r || typeof r !== "object") return p;
  p.games += 1;
  if (r.win > 0) p.wins += 1;
  else if (r.win < 0) p.losses += 1;
  else p.draws += 1;
  const t = r.type || {};
  for (const k of ["square", "circle", "triangle"]) {
    const v = Math.min(MAX_VALUES.type, Math.max(0, Math.round(t[k] || 0)));
    p.type[k] += v;
  }
  const ft = r.firstType;
  if (ft === "square" || ft === "circle" || ft === "triangle") p.firstType[ft] += 1;
  if (typeof r.centerSum === "number" && typeof r.centerCount === "number") {
    p.centerSum += Math.min(MAX_VALUES.centerSum, Math.max(0, r.centerSum));
    p.centerCount += Math.min(MAX_VALUES.type, Math.max(0, Math.round(r.centerCount)));
  }
  const th = r.threat || {};
  for (const k of ["attack", "defense", "neutral"]) {
    p.threat[k] += Math.min(MAX_VALUES.type, Math.max(0, Math.round(th[k] || 0)));
  }
  if (Array.isArray(r.thinkMs)) {
    for (const ms of r.thinkMs) {
      if (typeof ms === "number" && ms > 0 && p.thinkMs.length < MAX_THINK_SAMPLES) {
        p.thinkMs.push(Math.min(MAX_VALUES.thinkMs, Math.round(ms)));
      }
    }
  }
  return p;
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: Object.assign({}, CORS, { "Content-Type": "application/json" })
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }
    if (request.method === "GET" && url.pathname === "/profile") {
      const p = (await env.AI_KV.get(PROFILE_KEY, "json")) || emptyProfile();
      return json(p);
    }
    if (request.method === "POST" && url.pathname === "/report") {
      let body;
      try {
        body = await request.json();
      } catch (e) {
        return json({ ok: false, error: "bad json" }, 400);
      }
      const p = (await env.AI_KV.get(PROFILE_KEY, "json")) || emptyProfile();
      mergeReport(p, body);
      await env.AI_KV.put(PROFILE_KEY, JSON.stringify(p));
      return json({ ok: true });
    }
    return json({ ok: true, name: "sanxing-ai", endpoints: ["GET /profile", "POST /report"] });
  }
};
