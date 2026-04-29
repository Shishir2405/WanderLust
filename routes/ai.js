const express = require("express");
const router = express.Router();

const HF_MODEL =
  process.env.HF_MODEL || "mistralai/Mistral-7B-Instruct-v0.2";
const HF_ENDPOINT = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

function buildPrompt({ bullets, title, location, country, category }) {
  const cleanBullets = (bullets || "").trim();
  const meta = [
    title && `title: ${title}`,
    category && `category: ${category}`,
    location && `location: ${location}`,
    country && `country: ${country}`,
  ]
    .filter(Boolean)
    .join("; ");

  return [
    "<s>[INST] You are a friendly travel-listing copywriter for an Airbnb-style site.",
    "Write a warm, welcoming listing description in 4-6 sentences using the host's notes below.",
    "Avoid clichés, avoid superlatives like 'best ever', no emojis, no lists, just flowing paragraphs.",
    "Highlight what makes the place feel comfortable and unique. End with a one-line invitation.",
    meta ? `\nListing metadata: ${meta}.` : "",
    `\nHost's notes (bullets):\n${cleanBullets}`,
    "\nReturn only the description text, no preamble or commentary. [/INST]",
  ].join("");
}

function postProcess(raw) {
  if (!raw) return "";
  let text = String(raw);
  text = text.replace(/^\s*<\/s>\s*/g, "");
  text = text.replace(/\[\/?INST\]/g, "");
  text = text.replace(/^\s+|\s+$/g, "");
  return text;
}

router.post("/listing-description", express.json(), async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "auth required" });

  const token = process.env.HF_TOKEN;
  if (!token) {
    return res.status(503).json({
      error:
        "AI generator is not configured. Ask the admin to set the HF_TOKEN environment variable.",
    });
  }

  const { bullets } = req.body || {};
  if (!bullets || String(bullets).trim().length < 8) {
    return res.status(400).json({
      error: "Add a few bullets first (at least 8 characters).",
    });
  }

  const prompt = buildPrompt(req.body || {});
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const hfRes = await fetch(HF_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 280,
          temperature: 0.8,
          top_p: 0.95,
          return_full_text: false,
        },
        options: { wait_for_model: true },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!hfRes.ok) {
      const text = await hfRes.text();
      return res.status(502).json({
        error: "Generation failed",
        detail: text.slice(0, 300),
      });
    }

    const data = await hfRes.json();
    let generated = "";
    if (Array.isArray(data) && data[0] && data[0].generated_text) {
      generated = data[0].generated_text;
    } else if (data && data.generated_text) {
      generated = data.generated_text;
    } else {
      generated = JSON.stringify(data).slice(0, 600);
    }

    res.json({ description: postProcess(generated) });
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      return res.status(504).json({ error: "Generator timed out, try again" });
    }
    res.status(500).json({ error: "Unexpected error", detail: err.message });
  }
});

module.exports = router;
