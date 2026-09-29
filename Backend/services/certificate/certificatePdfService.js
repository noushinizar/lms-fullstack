import puppeteer from "puppeteer";
import { certificateTemplate } from "../../templates/certificateTemplate.js";

export const generateCertificatePDF = async (certificate) => {
  const browser = await puppeteer.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();

    // Give the page more time before timing out
    page.setDefaultNavigationTimeout(60000);

    const html = certificateTemplate({
      studentName: certificate.studentId.name,
      courseName: certificate.courseId.title,
      certificateId: certificate.certificateId,
      issuedDate: new Date(
        certificate.issuedAt
      ).toLocaleDateString(),
    });

    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
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