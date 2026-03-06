export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { architecture, intensity } = req.body || {};

  if (!architecture || !intensity) {
    return res.status(400).json({ error: "Missing architecture or intensity" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "Missing ANTHROPIC_API_KEY" });
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

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic error:", data);
      return res.status(500).json({ error: "Anthropic API error" });
    }

    const text = data.content.map((b) => b.text || "").join("");
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
