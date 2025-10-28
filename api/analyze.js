import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Only POST allowed");
  }

  const { url } = req.body;
  if (!url) return res.status(400).send("Missing URL");

  // ✅ YOUR OPENAI KEY HERE (you chose to hard-code)
  const openai = new OpenAI({
    apiKey: "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"
  });

  try {
    // --- 1) FETCH WEBPAGE HTML WITH HEADERS ---
    const htmlRes = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html"
      }
    });

    const html = await htmlRes.text();

    // --- 2) BASIC CLEAN EXTRACT PLAIN TEXT ---
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .slice(0, 9000); // limit to prevent token blowup

    // --- 3) GPT-4o-mini FACT CHECK PROMPT (NO STRICT JSON) ---
    const prompt = `
You are a fact-checking AI.

You will receive text extracted from a website. 
Your job:
1) Analyse if the claims are likely TRUE or FALSE or UNVERIFIED based on known facts
2) Provide a confidence score (0–100%)
3) Provide a short reasoning (1–3 sentences)
4) Name 2–4 **likely** authoritative sources that support your conclusion (even if approximate)
5) Return in clean readable text (not JSON).

----- BEGIN PAGE TEXT -----
${text}
----- END PAGE TEXT -----

Write response in this exact format:

Verdict: <True/Likely True/Likely False/False/Unverified>
Confidence: <number%>
Reason: <one short paragraph>
Sources:
- <source 1>
- <source 2>
- <source 3> (optional)
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });

    const answer = completion.choices[0].message.content;
    return res.status(200).send(answer);

  } catch (error) {
    return res.status(500).send("Server error: " + error.message);
  }
}
