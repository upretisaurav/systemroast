const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function supabaseSave(shareCode, data) {
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

export async function supabaseFetch(shareCode) {
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
      },
    );
    const data = await res.json();
    return data[0] || null;
  } catch (e) {
    console.error("Supabase fetch error:", e);
    return null;
  }
}

export async function callRoastAPI(architecture, intensity) {
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
