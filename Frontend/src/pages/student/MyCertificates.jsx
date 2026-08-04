import { useEffect, useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import { useNavigate } from "react-router-dom";

import {
  getMyCertificates,
  downloadCertificate,
  getCertificate,
} from "../../services/certificateService";
import { showError } from "../../utils/toast";

function MyCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const data = await getMyCertificates();
      setCertificates(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (courseId, certificateId) => {
    try {
      const pdf = await downloadCertificate(courseId);

      const url = window.URL.createObjectURL(new Blob([pdf]));

      const link = document.createElement("a");

      link.href = url;
      link.download = `${certificateId}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.log(error);
      showError("Failed to download certificate.");
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <h1 className="text-3xl font-bold">Loading Certificates...</h1>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <h1 className="text-3xl font-bold mb-8">🏆 My Certificates</h1>

      {certificates.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-10 text-center">
          <div className="text-6xl mb-5">🎓</div>

          <h2 className="text-2xl font-bold mb-2">No Certificates Yet</h2>

          <p className="text-gray-500">
            Complete a course to earn your first certificate.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((certificate) => (
            <div
              key={certificate._id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    🎓 {certificate.courseId.title}
                  </h2>

                  <p className="text-gray-500 mt-2">Issued On</p>

                  <p className="font-semibold">
                    {new Date(certificate.issuedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-5xl">🏆</div>
              </div>

              <hr className="my-5" />

              <p className="text-gray-500">Certificate ID</p>

              <p className="font-mono text-blue-600">
                {certificate.certificateId}
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() =>
                    navigate(`/student/certificate/${certificate.courseId._id}`)
                  }
                  className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-2 rounded-lg"
                >
                  👁 Preview
                </button>

                <button
                  onClick={() =>
                    handleDownload(
                      certificate.courseId._id,
                      certificate.certificateId,
                    )
                  }
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
                >
                  ⬇ Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </StudentLayout>
  );
}

export default MyCertificates;
