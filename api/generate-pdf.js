import PDFDocument from "pdfkit";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {

    const body = req.body || {};

    const currency = body.currency || "USD";

    const currentRevenue = Number(body.currentRevenue) || 0;
    const targetRevenue = Number(body.targetRevenue) || 0;
    const incomeGap = Number(body.incomeGap) || 0;
    const materialCost = Number(body.materialCost) || 0;
    const overhead = Number(body.overhead) || 0;
    const netProfit = Number(body.netProfit) || 0;
    const profitMargin = Number(body.profitMargin) || 0;
    const breakEvenRevenue = Number(body.breakEvenRevenue) || 0;
    const projectsNeeded = Number(body.projectsNeeded) || 0;

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Contractor-Profit-Report.pdf"
    );

    doc.pipe(res);

    /* ===============================
       PAGE 1 – EXECUTIVE OVERVIEW
    =============================== */

    doc.fontSize(24)
       .fillColor("#111")
       .text("CONTRACTOR PROFIT REPORT", { align: "center" });

    doc.moveDown(2);

    doc.fontSize(16).text("Executive Overview");
    doc.moveDown();

    doc.fontSize(12)
       .text(`Current Revenue: ${currency} ${currentRevenue.toLocaleString()}`)
       .text(`Target Revenue: ${currency} ${targetRevenue.toLocaleString()}`)
       .text(`Income Gap: ${currency} ${incomeGap.toLocaleString()}`);

    doc.moveDown(2);

    /* Health Score */

    let score = 0;

    if (profitMargin >= 30) score += 40;
    else if (profitMargin >= 20) score += 30;
    else if (profitMargin >= 10) score += 20;
    else score += 10;

    const gapPercent = targetRevenue > 0 ? (incomeGap / targetRevenue) * 100 : 0;

    if (gapPercent < 10) score += 30;
    else if (gapPercent < 25) score += 20;
    else score += 10;

    const materialRatio = currentRevenue > 0 ? (materialCost / currentRevenue) * 100 : 0;

    if (materialRatio < 25) score += 30;
    else if (materialRatio < 35) score += 20;
    else score += 10;

    let status = "Strong";
    let scoreColor = "#27ae60";

    if (score < 75) {
      status = "Moderate";
      scoreColor = "#f39c12";
    }
    if (score < 50) {
      status = "At Risk";
      scoreColor = "#c0392b";
    }

    doc.fontSize(14)
       .fillColor("#555")
       .text("Business Health Score");

    doc.fontSize(28)
       .fillColor(scoreColor)
       .text(`${score} / 100`);

    doc.fontSize(14)
       .text(status);

    doc.addPage();

    /* ===============================
       PAGE 2 – VISUAL DASHBOARD
    =============================== */

    doc.fontSize(20).fillColor("#111")
       .text("Financial Intelligence Dashboard");

    doc.moveDown(2);

    const barWidth = 400;

    /* Revenue vs Target */

    doc.fontSize(14).text("Revenue vs Target");
    doc.moveDown(0.5);

    const revenueRatio = targetRevenue > 0 ? currentRevenue / targetRevenue : 0;
    const revenueBar = barWidth * Math.min(revenueRatio, 1);

    doc.rect(doc.x, doc.y, barWidth, 15).fill("#eaeaea");
    doc.rect(doc.x, doc.y - 15, revenueBar, 15).fill("#27ae60");

    doc.moveDown(2);

    /* Cost Structure */

    doc.fontSize(14).fillColor("#111").text("Cost Structure");
    doc.moveDown(0.5);

    const totalCosts = materialCost + overhead;
    const costRatio = currentRevenue > 0 ? totalCosts / currentRevenue : 0;
    const costBar = barWidth * Math.min(costRatio, 1);

    doc.rect(doc.x, doc.y, barWidth, 15).fill("#eaeaea");
    doc.rect(doc.x, doc.y - 15, costBar, 15).fill("#c0392b");

    doc.moveDown(2);

    /* Profit Margin */

    doc.fontSize(14).text("Profit Margin Strength");
    doc.moveDown(0.5);

    const marginBar = barWidth * (profitMargin / 100);

    let marginColor = "#27ae60";
    if (profitMargin < 20) marginColor = "#f39c12";
    if (profitMargin < 10) marginColor = "#c0392b";

    doc.rect(doc.x, doc.y, barWidth, 15).fill("#eaeaea");
    doc.rect(doc.x, doc.y - 15, marginBar, 15).fill(marginColor);

    doc.moveDown(3);

    doc.fontSize(12)
       .text(`Material Cost: ${currency} ${materialCost.toLocaleString()}`)
       .text(`Overhead: ${currency} ${overhead.toLocaleString()}`)
       .text(`Net Profit: ${currency} ${netProfit.toLocaleString()}`)
       .text(`Break-even Revenue: ${currency} ${breakEvenRevenue.toLocaleString()}`)
       .text(`Projects Needed: ${projectsNeeded}`);

    doc.addPage();

    /* ===============================
       PAGE 3 – STRATEGIC ACTION PLAN
    =============================== */

    doc.fontSize(20).text("Strategic Action Plan");
    doc.moveDown(2);

    doc.fontSize(14).text("1. Margin Optimization");
    doc.moveDown(0.5);

    doc.fontSize(12)
       .text("- Increase pricing strategically (3–8%)")
       .text("- Renegotiate supplier agreements")
       .text("- Reduce material waste");

    doc.moveDown(1.5);

    doc.fontSize(14).text("2. Revenue Growth");
    doc.moveDown(0.5);

    doc.fontSize(12)
       .text("- Increase average project size")
       .text("- Improve quote conversion")
       .text("- Upsell premium services");

    doc.moveDown(2);

    doc.fontSize(10)
       .fillColor("gray")
       .text("Generated by Contractor Profit AI", { align: "center" });

    doc.end();

  } catch (error) {

    console.error("PDF ERROR:", error);
    res.status(500).json({ error: "PDF generation failed" });

  }
}
