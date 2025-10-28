document.getElementById("analyzeBtn").addEventListener("click", async () => {
  const resultDiv = document.getElementById("result");
  resultDiv.innerText = "Analyzing... Please wait.";

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab.url;

  try {
    const res = await fetch("https://final-681no81je-anshulsanchetis-projects.vercel.app/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    const text = await res.text();

    // -------- PARSE GPT RESPONSE --------
    const verdictMatch = text.match(/Verdict:\s*(.*)/i);
    const confidenceMatch = text.match(/Confidence:\s*(.*)/i);
    const reasonMatch = text.match(/Reason:\s*([\s\S]*?)Sources:/i);
    const sourcesMatch = text.match(/Sources:\s*([\s\S]*)/i);

    const verdict = verdictMatch ? verdictMatch[1].trim() : "Unknown";
    const confidence = confidenceMatch ? confidenceMatch[1].trim() : "—";
    const reason = reasonMatch ? reasonMatch[1].trim() : "—";
    const sources = sourcesMatch ? sourcesMatch[1].trim().split("\n").filter(s => s.trim()) : [];

    // -------- COLOR LOGIC --------
    let color = "black";
    if (/false/i.test(verdict)) color = "red";
    else if (/true/i.test(verdict)) color = "green";
    else color = "orange";

    // -------- BUILD HTML --------
    let html = `
      <div style="font-size:15px;margin-bottom:6px;">
        <b>Verdict:</b> <span style="color:${color};font-weight:600;">${verdict}</span>
      </div>
      <div><b>Confidence:</b> ${confidence}</div>
      <div style="margin-top:8px;"><b>Reason:</b><br>${reason}</div>
      <div style="margin-top:8px;"><b>Sources:</b></div>
      <ul style="margin-top:4px;">
    `;

    sources.forEach(s => {
      html += `<li>${s.replace(/^- /, "")}</li>`;
    });
    html += "</ul>";

    resultDiv.innerHTML = html;

  } catch (err) {
    resultDiv.innerText = "Error: " + err.message;
  }
});
