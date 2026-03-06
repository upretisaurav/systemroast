import { useState, useEffect, useRef } from "react";
import "./App.css";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

const LOADING_MSGS = [
  "bestie this is a lot to unpack...",
  "preparing your architectural eulogy...",
  "consulting the distributed systems oracle...",
  "your single point of failure said hi...",
  "calculating how cooked you are... fr fr",
  "the load balancer is crying rn...",
  "running vibes check on your db choices...",
  "bestie why is this on one EC2 instance...",
];

const GRADE_CONFIG = {
  S: { color: "#ffd700", label: "goated with the sauce", emoji: "👑" },
  A: { color: "#00ff88", label: "ate and left no crumbs", emoji: "✨" },
  B: { color: "#00cfff", label: "decent ngl", emoji: "💅" },
  C: { color: "#ffdd00", label: "mid but fixable", emoji: "😬" },
  D: { color: "#ff8800", label: "not it bestie", emoji: "💀" },
  F: { color: "#ff2200", label: "absolutely cooked fr fr", emoji: "🔥" },
};

const INTENSITY_OPTIONS = [
  { id: "bestie", label: "🤝 Bestie Mode", desc: "gentle but honest" },
  { id: "nocap", label: "🔥 No Cap", desc: "real talk, no filter" },
  { id: "nuclear", label: "☢️ Nuclear", desc: "no mercy, full chaos" },
];

async function supabaseSave(shareCode, data) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
    return false;
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/roasts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        share_code: shareCode,
        architecture_input: data.architecture_input,
        intensity: data.intensity,
        grade: data.grade,
        vibe_check: data.vibe_check,
        worst_crime: data.worst_crime,
        roast: data.roast,
        glow_up: data.glow_up,
      }),
    });
    return res.ok;
  } catch (e) {
    console.error("Supabase save error:", e);
    return false;
  }
}

async function supabaseFetch(shareCode) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
    return null;
  }

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/roasts?share_code=eq.${shareCode}&select=*`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    const data = await res.json();
    return data[0] || null;
  } catch (e) {
    console.error("Supabase fetch error:", e);
    return null;
  }
}

async function callClaude(architecture, intensity) {
  if (!ANTHROPIC_API_KEY) {
    throw new Error("Missing VITE_ANTHROPIC_API_KEY");
  }

  const intensityGuide = {
    bestie:
      "Be gentle but honest. Use Gen Z slang affectionately. Point out issues but stay supportive like a good friend reviewing a PR.",
    nocap:
      "Be direct and savage. No sugarcoating. Heavy Gen Z slang. Call out every bad decision like you're reviewing the worst PR of your life.",
    nuclear:
      "ABSOLUTELY UNHINGED. Maximum savagery. Make them question their career choices. Full chaos mode, existential dread, gen z slang overload.",
  };

  const prompt = `You are "RoastGPT", an elite system design roaster who speaks in Gen Z slang but has deep knowledge of distributed systems, scalability, and architecture patterns.

Intensity level: ${intensity.toUpperCase()}
Intensity guide: ${intensityGuide[intensity]}

Architecture to roast:
${architecture}

Respond ONLY with valid JSON (no markdown, no backticks, no text outside the JSON object):
{
  "grade": "one letter: S, A, B, C, D, or F",
  "grade_label": "short gen z phrase for this grade",
  "vibe_check": "one punchy sentence summarizing the whole situation in gen z speak",
  "worst_crime": "the single most egregious architectural problem, described dramatically in gen z style",
  "roast": "2-3 paragraphs roasting the architecture with specific technical callouts. Be technically accurate while being unhinged.",
  "glow_up": "2-3 specific actionable improvements written in gen z style but with real technical substance. The redemption arc."
}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Claude API error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const text = data.content.map((b) => b.text || "").join("");
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [architecture, setArchitecture] = useState("");
  const [intensity, setIntensity] = useState("nocap");
  const [result, setResult] = useState(null);
  const [shareCode, setShareCode] = useState("");
  const [viewCode, setViewCode] = useState("");
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MSGS[0]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [viewError, setViewError] = useState("");
  const [loadingView, setLoadingView] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (screen === "loading") {
      let i = 0;
      intervalRef.current = setInterval(() => {
        i = (i + 1) % LOADING_MSGS.length;
        setLoadingMsg(LOADING_MSGS[i]);
      }, 1800);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [screen]);

  const handleRoast = async () => {
    if (!architecture.trim()) {
      setError("bestie you forgot to describe your architecture 💀");
      return;
    }
    setError("");
    setScreen("loading");
    try {
      const roastData = await callClaude(architecture, intensity);
      const code = crypto.randomUUID().split("-")[0];
      await supabaseSave(code, {
        architecture_input: architecture,
        intensity,
        ...roastData,
      });
      setResult({ ...roastData, architecture_input: architecture, intensity });
      setShareCode(code);
      setScreen("result");
    } catch (e) {
      console.error(e);
      setError("something went wrong bestie, try again fr 😭");
      setScreen("home");
    }
  };

  const handleViewRoast = async () => {
    if (!viewCode.trim()) return;
    setViewError("");
    setLoadingView(true);
    const data = await supabaseFetch(viewCode.trim());
    setLoadingView(false);
    if (!data) {
      setViewError("no roast found with that code bestie 👀");
      return;
    }
    setResult(data);
    setShareCode(data.share_code);
    setScreen("result");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const gradeConf = result ? GRADE_CONFIG[result.grade] || GRADE_CONFIG.F : null;

  return (
    <div className="app">
      <div className="grain" />
      <div className="wrap">
        <div className="hdr">
          <div className="logo">
            SYSTEM<span>ROAST</span>
          </div>
          <div className="sub">your architecture, brutally reviewed</div>
        </div>

        <div className="hr" />

        {screen === "home" && (
          <>
            <div style={{ marginBottom: 22 }}>
              <div className="lbl">describe your architecture</div>
              <textarea
                className="ta"
                placeholder="e.g. Node.js monolith, Postgres as main db, Redis for caching, deployed on a single EC2 instance, no load balancer, S3 for file storage, no CDN..."
                value={architecture}
                onChange={(e) => setArchitecture(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <div className="lbl">roast intensity</div>
              <div className="ig">
                {INTENSITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    className={`ib ${intensity === opt.id ? "on" : ""}`}
                    onClick={() => setIntensity(opt.id)}
                  >
                    <div className="in">{opt.label}</div>
                    <div className="id">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button className="rbtn" onClick={handleRoast}>
              GET ROASTED 🔥
            </button>
            {error && <div className="err">{error}</div>}

            <div className="vs">
              <div className="lbl" style={{ marginBottom: 10 }}>
                got a share code?
              </div>
              <div className="vrow">
                <input
                  className="vi"
                  placeholder="paste code here..."
                  value={viewCode}
                  onChange={(e) => setViewCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleViewRoast()}
                />
                <button className="vbtn" onClick={handleViewRoast}>
                  {loadingView ? "loading..." : "view →"}
                </button>
              </div>
              {viewError && (
                <div className="err" style={{ textAlign: "left", marginTop: 8 }}>
                  {viewError}
                </div>
              )}
            </div>
          </>
        )}

        {screen === "loading" && (
          <div className="lscreen">
            <div className="ltitle">ANALYZING...</div>
            <div className="lmsg">{loadingMsg}</div>
            <div className="dots">
              <div className="dot" />
              <div className="dot" />
              <div className="dot" />
            </div>
          </div>
        )}

        {screen === "result" && result && gradeConf && (
          <>
            <div className="grade-blk">
              <div className="ibadge">{result.intensity} mode</div>
              <div className="grade-ltr" style={{ color: gradeConf.color }}>
                {result.grade} {gradeConf.emoji}
              </div>
              <div className="grade-sub" style={{ color: gradeConf.color }}>
                {result.grade_label || gradeConf.label}
              </div>
            </div>

            <div className="vc">"{result.vibe_check}"</div>

            <div className="wc">
              <div className="wct">⚠️ WORST CRIME</div>
              <div className="wcc">{result.worst_crime}</div>
            </div>

            <div className="sc">
              <div className="sct">🔥 THE ROAST</div>
              <div className="scc">{result.roast}</div>
            </div>

            <div className="gu">
              <div className="gut">✨ YOUR GLOW UP PLAN</div>
              <div className="guc">{result.glow_up}</div>
            </div>

            <div className="share">
              <div className="slbl">share code</div>
              <div className="scode">{shareCode}</div>
              <button className={`cbtn ${copied ? "ok" : ""}`} onClick={handleCopy}>
                {copied ? "✓ copied" : "copy"}
              </button>
            </div>

            <button
              className="abtn"
              onClick={() => {
                setScreen("home");
                setResult(null);
                setArchitecture("");
                setShareCode("");
                setCopied(false);
              }}
            >
              GET ROASTED AGAIN →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
