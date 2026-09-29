import puppeteer from "puppeteer";
import { certificateTemplate } from "../../templates/certificateTemplate.js";

export const generateCertificatePDF = async (certificate) => {
  const browser = await puppeteer.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();

    // ----------------------------------------------------------
    // PAGE SETTINGS
    // ----------------------------------------------------------

    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(60000);

    // ----------------------------------------------------------
    // GENERATE CERTIFICATE HTML
    // ----------------------------------------------------------

    const html = certificateTemplate({
      studentName: certificate.studentId.name,
      courseName: certificate.courseId.title,
      certificateId: certificate.certificateId,
      issuedDate: new Date(
        certificate.issuedAt
      ).toLocaleDateString(),
    });

    // ----------------------------------------------------------
    // LOAD HTML
    // ----------------------------------------------------------

    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });

    // ----------------------------------------------------------
    // WAIT FOR ALL IMAGES
    // ----------------------------------------------------------

    await page.evaluate(async () => {
      const images = Array.from(
        document.images
      );

      await Promise.all(
        images.map((img) => {
          if (img.complete) {
            return Promise.resolve();
          }

          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );
    });

    // ----------------------------------------------------------
    // SMALL DELAY FOR FINAL RENDERING
    // ----------------------------------------------------------

    await new Promise((resolve) =>
      setTimeout(resolve, 500)
    );

    // ----------------------------------------------------------
    // GENERATE A4 PORTRAIT PDF
    // ----------------------------------------------------------

    const pdf = await page.pdf({
      format: "A4",

      landscape: false,

      printBackground: true,

      preferCSSPageSize: true,

      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },
    });

    return pdf;
  } finally {
    // ----------------------------------------------------------
    // CLOSE BROWSER
    // ----------------------------------------------------------

    await browser.close();
  }
};

