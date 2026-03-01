export const config = {
  runtime: "nodejs",
};

import puppeteer from "puppeteer";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {

    const html = `
      <html>
      <body style="font-family: Arial; padding:40px;">
        <h1>PDF Test Works</h1>
        <p>If you can read this, Puppeteer works.</p>
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: "new",
    });

    const page = await browser.newPage();
    await page.setContent(html);

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=test.pdf"
    );

    res.status(200).send(pdfBuffer);

  } catch (error) {
    console.error("PDF ERROR:", error);
    res.status(500).json({ error: "PDF generation failed" });
  }
}
