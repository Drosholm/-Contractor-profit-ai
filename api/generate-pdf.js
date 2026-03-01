export const config = {
  runtime: "nodejs",
};

import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {
    const {
      currency = "USD",
      currentRevenue = 0,
      targetRevenue = 0,
      materialCost = 0,
      overhead = 0,
      netProfit = 0,
      profitMargin = 0,
      breakEvenRevenue = 0,
      projectsNeeded = 0
    } = req.body;

    const incomeGap = targetRevenue - currentRevenue;

    const gapPercent =
      targetRevenue > 0
        ? ((incomeGap / targetRevenue) * 100).toFixed(1)
        : 0;

    const revenuePercent =
      targetRevenue > 0
        ? Math.min((currentRevenue / targetRevenue) * 100, 100)
        : 0;

    const costPercent =
      currentRevenue > 0
        ? Math.min(((materialCost + overhead) / currentRevenue) * 100, 100)
        : 0;

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 40px;
  background: #f8fafc;
  color: #111;
}

h1 {
  font-size: 26px;
  margin-bottom: 5px;
}

h2 {
  margin-top: 35px;
}

.card {
  background: white;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.green { color: #16a34a; }
.red { color: #dc2626; }

.bar {
  height: 14px;
  background: #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 6px;
}

.fill {
  height: 100%;
}

</style>
</head>

<body>

<h1>Contractor Profit Intelligence Report</h1>

<div class="card">
  <strong>Current Revenue:</strong> ${currency} ${Number(currentRevenue).toLocaleString()}<br>
  <strong>Target Revenue:</strong> ${currency} ${Number(targetRevenue).toLocaleString()}<br>
  <strong>Income Gap:</strong> 
  <span class="${incomeGap > 0 ? "red" : "green"}">
  ${currency} ${Number(incomeGap).toLocaleString()}
  </span>
</div>

<h2>Performance Metrics</h2>

<div class="card">
  <strong>Net Profit:</strong> 
  <span class="green">
  ${currency} ${Number(netProfit).toLocaleString()}
  </span><br>

  <strong>Profit Margin:</strong> ${profitMargin}%<br>
  <strong>Break-even Revenue:</strong> ${currency} ${Number(breakEvenRevenue).toLocaleString()}<br>
  <strong>Projects Needed:</strong> ${projectsNeeded}
</div>

<h2>Revenue Progress</h2>
<div class="bar">
  <div class="fill" style="width:${revenuePercent}%; background:#16a34a;"></div>
</div>

<h2>Cost Structure</h2>
<div class="bar">
  <div class="fill" style="width:${costPercent}%; background:#dc2626;"></div>
</div>

<h2>Profit Strength</h2>
<div class="bar">
  <div class="fill" style="width:${profitMargin}%; background:#0ea5e9;"></div>
</div>

<div class="card">
  <h2>Strategic Summary</h2>
  <p>
  Your current margin is ${profitMargin}%.  
  The income gap represents ${gapPercent}% of your target.  
  Focus on pricing discipline, cost optimization and increasing average project value.
  </p>
</div>

</body>
</html>
`;

    const browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        "--hide-scrollbars",
        "--disable-web-security"
      ],
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Contractor-Profit-Report.pdf"
    );

    res.status(200).send(pdfBuffer);

  } catch (error) {
    console.error("PDF ERROR:", error);
    res.status(500).json({ error: "PDF generation failed" });
  }
}
