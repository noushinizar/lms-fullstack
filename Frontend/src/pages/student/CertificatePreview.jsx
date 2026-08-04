import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

import StudentLayout from "../../layouts/StudentLayout";
import Certificate from "../../components/certificate/Certificate";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

import { getCertificate } from "../../services/certificateService";

function CertificatePreview() {
  const { courseId } = useParams();

  const [certificate, setCertificate] = useState(null);

  const [loading, setLoading] = useState(true);

  const certificateRef = useRef();

  useEffect(() => {
    fetchCertificate();
  }, []);

  const fetchCertificate = async () => {
    try {
      const data = await getCertificate(courseId);

      setCertificate(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
  if (!certificateRef.current) return;

  try {

    const dataUrl = await toPng(certificateRef.current, {
      pixelRatio: 3,
      cacheBust: true,
      backgroundColor: "#ffffff",
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210;
    const pageHeight = 297;

    pdf.addImage(
      dataUrl,
      "PNG",
      0,
      0,
      pageWidth,
      pageHeight
    );

    pdf.save(
      `${certificate.studentId.name}-Certificate.pdf`
    );

  } catch (error) {
    console.log(error);
  }
};
  if (loading) {
    return (
      <StudentLayout>
        <div className="text-center py-20">
          <h1 className="text-3xl font-bold">Loading Certificate...</h1>
        </div>
      </StudentLayout>
    );
  }

  if (!certificate) {
    return (
      <StudentLayout>
        <div className="text-center py-20">
          <h1 className="text-3xl font-bold text-red-600">
            Certificate Not Found
          </h1>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="flex justify-end mb-6">
        <button
          onClick={handleDownload}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition"
        >
          ⬇ Download PDF
        </button>
      </div>

      <Certificate ref={certificateRef} certificate={certificate} />
    </StudentLayout>
  );
}

export default CertificatePreview;


