import { INTENSITY_OPTIONS } from "../constants";

export default function HomeScreen({
    architecture,
    setArchitecture,
    intensity,
    setIntensity,
    onRoast,
    error,
    viewCode,
    setViewCode,
    onViewRoast,
    loadingView,
    viewError,
}) {
    return (
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

            <button className="rbtn" onClick={onRoast}>
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
                        onKeyDown={(e) => e.key === "Enter" && onViewRoast()}
                    />
                    <button className="vbtn" onClick={onViewRoast}>
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
    );
}
