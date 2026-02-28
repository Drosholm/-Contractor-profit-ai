import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const {
      currency,
      currentRate,
      requiredRate,
      hours,
      materialPercent,
      overhead,
      employees,
      projectSize
    } = req.body;

    const symbolMap = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      AUD: "A$"
    };

    const symbol = symbolMap[currency] || "";

    // Convert safely to numbers
    const current = Number(currentRate) || 0;
    const target = Number(requiredRate) || 0;
    const billableHours = Number(hours) || 0;
    const materialPct = (Number(materialPercent) || 0) / 100;
    const yearlyOverhead = Number(overhead) || 0;
    const avgProject = Number(projectSize) || 0;
    const staff = Number(employees) || 0;

    // === CALCULATIONS ===

    const currentRevenue = current * billableHours;
    const targetRevenue = target * billableHours;

    const materialCost = currentRevenue * materialPct;
    const grossProfit = currentRevenue - materialCost;
    const netProfit = grossProfit - yearlyOverhead;

    const profitMargin =
      currentRevenue > 0
        ? ((netProfit / currentRevenue) * 100).toFixed(1)
        : 0;

    const incomeGap = targetRevenue - currentRevenue;

    const breakEvenRevenue =
      materialPct < 1
        ? yearlyOverhead / (1 - materialPct)
        : 0;

    const projectsNeeded =
      avgProject > 0
        ? Math.ceil(targetRevenue / avgProject)
        : 0;

    // === AI ADVICE PROMPT (FIXED - NO MARKDOWN) ===

    const prompt = `
You are a professional business advisor for contractors.

Business data:

Current revenue: ${symbol}${currentRevenue}
Target revenue: ${symbol}${targetRevenue}
Material cost: ${symbol}${materialCost}
Annual overhead: ${symbol}${yearlyOverhead}
Net profit: ${symbol}${netProfit}
Profit margin: ${profitMargin}%
Employees: ${staff}
Average project value: ${symbol}${avgProject}

Provide short, sharp strategic advice on:

1. Pricing
2. Cost control
3. Revenue growth
4. Operational efficiency

Use clean HTML formatting with <h3>, <p>, <ul>, <li>.
Do NOT use markdown.
Do NOT use code blocks.
Do NOT include \`\`\` or \`\`\`html.
Return pure HTML only.
Keep it executive and professional.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const aiAdvice = completion.choices[0].message.content;

    // === FINAL HTML OUTPUT ===

    const result = `
<h2>Business Profit Analysis</h2>

<h3>Revenue Overview</h3>
<p><strong>Current Revenue:</strong> ${symbol}${currentRevenue.toLocaleString()}</p>
<p><strong>Target Revenue:</strong> ${symbol}${targetRevenue.toLocaleString()}</p>
<p><strong>Income Gap:</strong> ${symbol}${incomeGap.toLocaleString()}</p>

<h3>Cost Structure</h3>
<p><strong>Material Cost (${materialPercent}%):</strong> ${symbol}${materialCost.toLocaleString()}</p>
<p><strong>Annual Overhead:</strong> ${symbol}${yearlyOverhead.toLocaleString()}</p>

<h3>Profitability</h3>
<p><strong>Net Profit:</strong> ${symbol}${netProfit.toLocaleString()}</p>
<p><strong>Profit Margin:</strong> ${profitMargin}%</p>
<p><strong>Break-even Revenue:</strong> ${symbol}${Math.round(breakEvenRevenue).toLocaleString()}</p>

<h3>Operational Metrics</h3>
<p><strong>Projects Needed to Hit Target:</strong> ${projectsNeeded}</p>

<hr>

${aiAdvice}
`;

    res.status(200).json({ result });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}
