export const certificateTemplate = ({
  studentName,
  courseName,
  certificateId,
  issuedDate,
}) => {

return `
<!doctype html>

<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        background: #f5f5f5;
        padding: 40px;
      }

      .certificate {
        width: 900px;
        height: 550px;

        margin: auto;

        background: rgb(247, 235, 231);

        border: 15px solid #b0521f;

        padding: 40px;

        text-align: center;

        position: relative;
      }

      .logo {
        font-size: 40px;
        font-weight: bold;
        color: #a86012;
      }

      .title {
        font-size: 44px;
        margin-top: 30px;
        letter-spacing: 5px;
      }

      .subtitle {
        font-size: 20px;
        margin-top: 30px;
      }

      .student {
        font-size: 45px;
        font-weight: bold;
        color: #ba650b;

        margin: 30px;
      }

      .course {
        font-size: 30px;
        color: #ba650b;
      }

      .details {
        margin-top: 50px;

        display: flex;

        justify-content: space-around;

        font-size: 18px;
      }

      .footer {
        position: absolute;

        bottom: 20px;

        left: 0;

        right: 0;
      }

      .signature {
        margin-top: 10px;
      }
    </style>
  </head>

  <body>
    <div class="certificate">
      <div class="logo">ASTROBYTE ACADEMY</div>

      <div class="title">COURSE COMPLETION CERTIFICATE</div>

      <div class="subtitle">This certificate is proudly presented to</div>

      <div class="student">${studentName}</div>

      <div class="subtitle">For successfully completing the course</div>

      <div class="course">${courseName}</div>

      <div class="details">
        <div>
          <strong>Certificate ID</strong>

          <br />

          ${certificateId}
        </div>

        <div>
          <strong>Issued Date</strong>

          <br />

          ${issuedDate}
        </div>
      </div>

      <div class="footer">
        <div class="signature">
         <img src="https://img.sanishtech.com/u/ba7110aecaf0207653d8e1ce45e37dcc.png" alt="noushi-sign" width="150" height="150" loading="lazy" style="max-width:100%;height:auto;">
          <br />
          Project Manager
        </div>
      </div>
    </div>
  </body>
</html>
`;

};