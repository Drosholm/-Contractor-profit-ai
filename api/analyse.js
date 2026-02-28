import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { currentRate, requiredRate, hours, currency } = req.body;

    const symbolMap = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      AUD: "A$"
    };

    const symbol = symbolMap[currency] || "";

    const prompt = `
You are a business profit advisor.

Use ${symbol} as the currency symbol in ALL calculations and text.

Current hourly rate: ${symbol}${currentRate}
Required hourly rate: ${symbol}${requiredRate}
Billable hours per year: ${hours}

Provide:

1. Current annual income
2. Target annual income
3. Income gap
4. Short improvement advice

Use clean HTML formatting (h3, p, strong). 
DO NOT use markdown.
DO NOT use LaTeX.
DO NOT use $ unless it matches the currency symbol provided.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    const result = completion.choices[0].message.content;

    res.status(200).json({ result });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}
