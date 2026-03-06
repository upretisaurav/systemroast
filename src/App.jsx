import { useState, useEffect, useRef } from "react";
import { Analytics } from "@vercel/analytics/react";
import "./App.css";
import { LOADING_MSGS, GRADE_CONFIG } from "./constants";
import { supabaseSave, supabaseFetch, callRoastAPI } from "./api";
import HomeScreen from "./components/HomeScreen";
import LoadingScreen from "./components/LoadingScreen";
import ResultScreen from "./components/ResultScreen";

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

  const handleRoastAgain = () => {
    setScreen("home");
    setResult(null);
    setArchitecture("");
    setShareCode("");
    setCopied(false);
    window.history.replaceState({}, "", window.location.pathname);
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
          <HomeScreen
            architecture={architecture}
            setArchitecture={setArchitecture}
            intensity={intensity}
            setIntensity={setIntensity}
            onRoast={handleRoast}
            error={error}
            viewCode={viewCode}
            setViewCode={setViewCode}
            onViewRoast={handleViewRoast}
            loadingView={loadingView}
            viewError={viewError}
          />
        )}

        {screen === "loading" && <LoadingScreen loadingMsg={loadingMsg} />}

        {screen === "result" && result && gradeConf && (
          <ResultScreen
            result={result}
            gradeConf={gradeConf}
            shareCode={shareCode}
            copied={copied}
            onCopyCode={handleCopyCode}
            onCopyLink={handleCopyLink}
            onRoastAgain={handleRoastAgain}
          />
        )}
      </div>
    </div>
  );
}

