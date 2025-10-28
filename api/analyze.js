const OpenAI = require("openai");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Only POST allowed");
  }

  const { url } = req.body;
  if (!url) return res.status(400).send("Missing URL");

  const openai = new OpenAI({
    apiKey: "sk-proj-REPLACE"
  });

  try {
    const htmlRes = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html"
      }
    });

    const html = await htmlRes.text();

    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .slice(0, 9000);

    const prompt = `Fact-check this: ${text}`;

    const r = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    return res.status(200).send(r.choices[0].message.content);

  } catch (err) {
    return res.status(500).send("Server error: " + err.message);
  }
};
