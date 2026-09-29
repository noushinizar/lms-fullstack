import fs from "node:fs";
import puppeteer from "puppeteer";

import { certificateTemplate } from "../../templates/certificateTemplate.js";

export const generateCertificatePDF = async (certificate) => {
  // Diagnostic: check whether Puppeteer's Chrome is installed
  const chromePath = puppeteer.executablePath();

  console.log("Puppeteer Chrome path:", chromePath);
  console.log("Chrome exists:", fs.existsSync(chromePath));

  const browser = await puppeteer.launch({
    headless: "new",
  });

  try {
    const page = await browser.newPage();

    const html = certificateTemplate({
      studentName: certificate.studentId.name,
      courseName: certificate.courseId.title,
      certificateId: certificate.certificateId,
      issuedDate: new Date(
        certificate.issuedAt
      ).toLocaleDateString(),
    });

    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      landscape: true,
    });

    return pdf;
  } finally {
    await browser.close();
  }
};