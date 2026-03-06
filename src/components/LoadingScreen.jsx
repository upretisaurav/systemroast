export default function LoadingScreen({ loadingMsg }) {
    return (
        <div className="lscreen">
            <div className="ltitle">ANALYZING...</div>
            <div className="lmsg">{loadingMsg}</div>
            <div className="dots">
                <div className="dot" />
                <div className="dot" />
                <div className="dot" />
            </div>
        </div>
    );
}
