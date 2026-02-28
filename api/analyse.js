export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { currentRate, requiredRate, hours } = req.body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional business advisor helping contractors increase profit."
          },
          {
            role: "user",
            content: `
Current hourly rate: ${currentRate}
Required hourly rate: ${requiredRate}
Billable hours per year: ${hours}

Give a short and clear profit analysis and improvement advice.
`
          }
        ]
      })
    });

    const data = await response.json();

    return res.status(200).json({
      result: data.choices?.[0]?.message?.content || "No response from AI."
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
