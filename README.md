# SystemRoast 🔥

Describe your system architecture. Get absolutely cooked in Gen Z slang. Actually learn something.

**[systemroast.vercel.app](https://systemroast.vercel.app)**

---

## Stack

- **React + Vite** — frontend
- **Vercel Serverless** (`/api/roast.js`) — proxies Anthropic API, keeps key server-side
- **Claude API** — generates the roast
- **Supabase** — persists roasts, enables shareable links

## Setup

```bash
git clone https://github.com/yourusername/systemroast
cd systemroast
npm install
```

Create a `.env` file:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

```bash
npm run dev
```

## Deploy

```bash
vercel
```

Add `ANTHROPIC_API_KEY` in Vercel → Project Settings → Environment Variables.

## Supabase

Run this in your Supabase SQL editor:

```sql
create table roasts (
  id uuid default gen_random_uuid() primary key,
  share_code text unique not null,
  architecture_input text not null,
  intensity text not null,
  grade text not null,
  grade_label text,
  vibe_check text not null,
  worst_crime text not null,
  roast text not null,
  glow_up text not null,
  created_at timestamp default now()
);

alter table roasts enable row level security;
create policy "Public can insert" on roasts for insert with check (true);
create policy "Public can read" on roasts for select using (true);
```

Update `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `App.jsx` with your project's values.
