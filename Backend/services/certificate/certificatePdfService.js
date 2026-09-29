import puppeteer from "puppeteer";
import { certificateTemplate } from "../../templates/certificateTemplate.js";

export const generateCertificatePDF = async (certificate) => {
  let browser;

  try {
    // ----------------------------------------------------------
    // LAUNCH PUPPETEER
    // ----------------------------------------------------------

    browser = await puppeteer.launch({
      headless: true,

      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
      ],
    });

    const page = await browser.newPage();

    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(30000);

    // ----------------------------------------------------------
    // GENERATE HTML
    // ----------------------------------------------------------

    const html = certificateTemplate({
      studentName:
        certificate.studentId.name,

      courseName:
        certificate.courseId.title,

      certificateId:
        certificate.certificateId,

      issuedDate: new Date(
        certificate.issuedAt
      ).toLocaleDateString(),
    });

    // ----------------------------------------------------------
    // LOAD HTML
    //
    // IMPORTANT:
    // Do NOT use networkidle0 here.
    // Remote images can keep the network busy on Render.
    // ----------------------------------------------------------

    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // ----------------------------------------------------------
    // WAIT FOR IMAGES
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
    // WAIT FOR FONTS
    // ----------------------------------------------------------

    await page.evaluate(async () => {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
    });

    // ----------------------------------------------------------
    // SHORT RENDER DELAY
    // ----------------------------------------------------------

    await new Promise((resolve) =>
      setTimeout(resolve, 300)
    );

    // ----------------------------------------------------------
    // GENERATE PDF
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
  } catch (error) {
    console.error(
      "CERTIFICATE PDF GENERATION ERROR:",
      error
    );

    throw error;
  } finally {
    // ----------------------------------------------------------
    // ALWAYS CLOSE BROWSER
    // ----------------------------------------------------------

    if (browser) {
      await browser.close();
    }
  }
};

