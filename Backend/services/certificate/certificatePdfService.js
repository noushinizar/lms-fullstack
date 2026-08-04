import puppeteer from "puppeteer";
import { certificateTemplate } from "../../templates/certificateTemplate.js";

export const generateCertificatePDF = async (certificate) => {
  const browser = await puppeteer.launch({
    headless: "new",
  });

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

  await browser.close();

  return pdf;
};