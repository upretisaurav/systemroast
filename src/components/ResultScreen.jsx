import { GRADE_CONFIG } from "../constants";

export default function ResultScreen({
    result,
    gradeConf,
    shareCode,
    copied,
    onCopyCode,
    onCopyLink,
    onRoastAgain,
}) {
    return (
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
                    <button className={`cbtn ${copied ? "ok" : ""}`} onClick={onCopyCode}>
                        {copied ? "✓ copied" : "copy code"}
                    </button>
                    <button className="cbtn" onClick={onCopyLink}>
                        copy link 🔗
                    </button>
                </div>
            </div>

            <button className="abtn" onClick={onRoastAgain}>
                GET ROASTED AGAIN →
            </button>
        </>
    );
}
