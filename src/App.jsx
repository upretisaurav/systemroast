import { useState, useEffect, useRef } from "react";
import { Analytics } from "@vercel/analytics/react";
import "./App.css";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
        grade_label: data.grade_label,
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

async function callRoastAPI(architecture, intensity) {
  const response = await fetch("/api/roast", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ architecture, intensity }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
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
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      setViewCode(code);
      handleViewRoastByCode(code);
    }
  }, []);

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
      const roastData = await callRoastAPI(architecture, intensity);
      const code = crypto.randomUUID().split("-")[0];
      await supabaseSave(code, {
        architecture_input: architecture,
        intensity,
        ...roastData,
      });
      setResult({ ...roastData, architecture_input: architecture, intensity });
      setShareCode(code);
      window.history.replaceState({}, "", `?code=${code}`);
      setScreen("result");
    } catch (e) {
      console.error(e);
      setError("something went wrong bestie, try again fr 😭");
      setScreen("home");
    }
  };

  const handleViewRoastByCode = async (code) => {
    setViewError("");
    setLoadingView(true);
    const data = await supabaseFetch(code);
    setLoadingView(false);
    if (!data) {
      setViewError("no roast found with that code bestie 👀");
      return;
    }
    setResult(data);
    setShareCode(data.share_code);
    setScreen("result");
  };

  const handleViewRoast = async () => {
    if (!viewCode.trim()) return;
    await handleViewRoastByCode(viewCode.trim());
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}?code=${shareCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const gradeConf = result ? GRADE_CONFIG[result.grade] || GRADE_CONFIG.F : null;

  return (
    <div className="app">
      <Analytics />
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
              <div className="share-row">
                <div className="slbl">share code</div>
                <div className="scode">{shareCode}</div>
              </div>
              <div className="share-btns">
                <button className={`cbtn ${copied ? "ok" : ""}`} onClick={handleCopyCode}>
                  {copied ? "✓ copied" : "copy code"}
                </button>
                <button className="cbtn" onClick={handleCopyLink}>
                  copy link 🔗
                </button>
              </div>
            </div>

            <button
              className="abtn"
              onClick={() => {
                setScreen("home");
                setResult(null);
                setArchitecture("");
                setShareCode("");
                setCopied(false);
                window.history.replaceState({}, "", window.location.pathname);
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
