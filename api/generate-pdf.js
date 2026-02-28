const PDFDocument = require("pdfkit");

export default function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {

    const body = req.body;

    const currency = body.currency;

    const currentRevenue = Number(body.currentRevenue) || 0;
    const targetRevenue = Number(body.targetRevenue) || 0;
    const incomeGap = Number(body.incomeGap) || 0;
    const materialCost = Number(body.materialCost) || 0;
    const overhead = Number(body.overhead) || 0;
    const netProfit = Number(body.netProfit) || 0;
    const profitMargin = Number(body.profitMargin) || 0;
    const breakEvenRevenue = Number(body.breakEvenRevenue) || 0;
    const projectsNeeded = Number(body.projectsNeeded) || 0;

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Business-Profit-Analysis.pdf"
    );

    doc.pipe(res);

    doc.fontSize(20).text("CONTRACTOR PROFIT REPORT", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text("Executive Summary");
    doc.moveDown();

    doc.fontSize(12).text(
      `Revenue: ${currency} ${currentRevenue.toLocaleString()}`
    );
    doc.text(
      `Target: ${currency} ${targetRevenue.toLocaleString()}`
    );
    doc.text(
      `Income Gap: ${currency} ${incomeGap.toLocaleString()}`
    );

    doc.addPage();

    doc.fontSize(16).text("Financial Dashboard");
    doc.moveDown();

    doc.text(`Net Profit: ${currency} ${netProfit.toLocaleString()}`);
    doc.text(`Profit Margin: ${profitMargin}%`);
    doc.text(`Break-even Revenue: ${currency} ${breakEvenRevenue.toLocaleString()}`);
    doc.text(`Projects Needed: ${projectsNeeded}`);

    doc.end();

  } catch (error) {

    console.error("PDF ERROR:", error);
    res.status(500).json({ error: "PDF generation failed" });

  }
}
