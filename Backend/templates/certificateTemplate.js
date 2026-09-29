
export const certificateTemplate = ({
  studentName,
  courseName,
  certificateId,
  issuedDate,
}) => {
  // Prevent HTML characters in dynamic certificate data
  const escapeHtml = (value = '') =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const safeStudentName =
    escapeHtml(studentName || 'Student');

  const safeCourseName =
    escapeHtml(courseName || 'Course');

  const safeCertificateId =
    escapeHtml(certificateId || '');

  const safeIssuedDate =
    escapeHtml(issuedDate || '');

  // Same assets used by the Flutter preview
  const logoUrl =
    'https://lms-fullstack-lac.vercel.app/assets/logo-Bpck0D4t.png';

  const signatureUrl =
    'https://lms-fullstack-lac.vercel.app/assets/signature-BOYiio2o.png';

  return `
<!DOCTYPE html>

<html lang="en">

<head>

  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>Certificate</title>

  <style>

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    @page {
      size: A4 portrait;
      margin: 0;
    }

    html,
    body {
      width: 595px;
      height: 842px;
      margin: 0;
      padding: 0;
      background: #ffffff;
    }

    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #202A3A;
    }

    /* =========================================================
       CERTIFICATE
       ========================================================= */

    .certificate {
      position: relative;

      width: 595px;
      height: 842px;

      background: #ffffff;

      border: 1px solid #E2E2E2;

      overflow: hidden;
    }

    /* =========================================================
       MAIN CONTENT
       ========================================================= */

    .main-content {
      position: absolute;

      top: 63px;
      left: 36px;
      right: 36px;

      text-align: center;
    }

    /* =========================================================
       LOGO
       ========================================================= */

    .logo {
      width: 50px;
      height: 50px;

      object-fit: contain;

      display: block;

      margin: 0 auto;
    }

    /* =========================================================
       ACADEMY NAME
       ========================================================= */

    .academy-name {
      margin-top: 25px;

      color: #B9560B;

      font-size: 15px;

      font-weight: 800;

      letter-spacing: 4px;

      line-height: 1.2;

      text-align: center;
    }

    /* =========================================================
       TITLE
       ========================================================= */

    .certificate-title {
      margin-top: 25px;

      color: #202A3A;

      font-family: Georgia, 'Times New Roman', serif;

      font-size: 36px;

      font-weight: 700;

      line-height: 1.15;

      text-align: center;
    }

    /* =========================================================
       TITLE DIVIDER
       ========================================================= */

    .title-divider {
      width: 180px;

      height: 3px;

      margin: 17px auto 0;

      background: #202A3A;
    }

    /* =========================================================
       PRESENTED TO
       ========================================================= */

    .presented-text {
      margin-top: 28px;

      color: #737780;

      font-size: 18px;

      font-weight: 400;

      line-height: 1.3;

      text-align: center;
    }

    /* =========================================================
       STUDENT NAME
       ========================================================= */

    .student-name {
      margin-top: 25px;

      color: #202A3A;

      font-size: 34px;

      font-weight: 800;

      line-height: 1.2;

      text-align: center;

      word-break: break-word;
    }

    /* =========================================================
       COMPLETION TEXT
       ========================================================= */

    .completion-text {
      margin-top: 34px;

      color: #737780;

      font-size: 18px;

      font-weight: 400;

      line-height: 1.3;

      text-align: center;
    }

    /* =========================================================
       COURSE NAME
       ========================================================= */

    .course-name {
      margin-top: 25px;

      color: #202A3A;

      font-size: 32px;

      font-weight: 500;

      line-height: 1.4;

      text-align: center;

      word-break: break-word;
    }

    /* =========================================================
       BOTTOM INFORMATION
       ========================================================= */

    .bottom-section {
      position: absolute;

      left: 48px;
      right: 48px;
      bottom: 63px;

      display: flex;

      align-items: flex-end;

      justify-content: space-between;
    }

    /* =========================================================
       CERTIFICATE DETAILS
       ========================================================= */

    .certificate-details {
      width: 45%;

      text-align: left;
    }

    .detail-label {
      color: #737780;

      font-size: 10px;

      font-weight: 400;

      line-height: 1.2;
    }

    .detail-value {
      margin-top: 3px;

      color: #000000;

      font-size: 12px;

      font-weight: 500;

      line-height: 1.3;

      word-break: break-word;
    }

    .issued-date {
      margin-top: 22px;
    }

    /* =========================================================
       SIGNATURE
       ========================================================= */

    .signature-section {
      width: 27%;

      text-align: center;
    }

    .signature-image-container {
      height: 90px;

      display: flex;

      align-items: flex-end;

      justify-content: center;
    }

    .signature-image {
      max-width: 100%;

      max-height: 90px;

      width: auto;

      height: auto;

      object-fit: contain;

      display: block;
    }

    .signature-line {
      width: 100%;

      height: 1px;

      margin-top: 0;

      background: #CCCCCC;
    }

    .signer-name {
      margin-top: 8px;

      color: #000000;

      font-size: 14px;

      font-weight: 600;

      line-height: 1.2;
    }

    .signer-role {
      margin-top: 3px;

      color: #737780;

      font-size: 11px;

      font-weight: 400;

      line-height: 1.2;
    }

  </style>

</head>

<body>

  <div class="certificate">

    <!-- =====================================================
         MAIN CERTIFICATE CONTENT
         ===================================================== -->

    <div class="main-content">

      <!-- LOGO -->

      <img
        class="logo"
        src="${logoUrl}"
        alt="Astrobyte Academy"
      />

      <!-- ACADEMY NAME -->

      <div class="academy-name">
        ASTROBYTE ACADEMY
      </div>

      <!-- CERTIFICATE TITLE -->

      <div class="certificate-title">
        Certificate of Completion
      </div>

      <!-- DIVIDER -->

      <div class="title-divider"></div>

      <!-- PRESENTED TO -->

      <div class="presented-text">
        This Certificate is Proudly Presented To
      </div>

      <!-- STUDENT -->

      <div class="student-name">
        ${safeStudentName}
      </div>

      <!-- COMPLETION -->

      <div class="completion-text">
        For Successfully Completing
      </div>

      <!-- COURSE -->

      <div class="course-name">
        ${safeCourseName}
      </div>

    </div>


    <!-- =====================================================
         BOTTOM SECTION
         ===================================================== -->

    <div class="bottom-section">

      <!-- CERTIFICATE DETAILS -->

      <div class="certificate-details">

        <div class="detail-label">
          Certificate ID
        </div>

        <div class="detail-value">
          ${safeCertificateId}
        </div>


        <div class="issued-date">

          <div class="detail-label">
            Issued On
          </div>

          <div class="detail-value">
            ${safeIssuedDate}
          </div>

        </div>

      </div>


      <!-- SIGNATURE -->

      <div class="signature-section">

        <div class="signature-image-container">

          <img
            class="signature-image"
            src="${signatureUrl}"
            alt="Noushida signature"
          />

        </div>

        <div class="signature-line"></div>

        <div class="signer-name">
          Noushida p
        </div>

        <div class="signer-role">
          Project Manager
        </div>

      </div>

    </div>

  </div>

</body>

</html>
`;
};

