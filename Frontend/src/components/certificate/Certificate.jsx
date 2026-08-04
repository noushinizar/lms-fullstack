import { forwardRef } from "react";
import CertificateHeader from "./CertificateHeader";
import CertificateFooter from "./CertificateFooter";

const Certificate = forwardRef(({ certificate }, ref) => {
  if (!certificate) return null;

  return (
    <div className="flex justify-center py-10">

      <div
        ref={ref}
        id="certificate"
        className="
          bg-white
          w-198.5
          h-280.75
          shadow-2xl
          border
          border-gray-300
          rounded-lg
          p-16
          flex
          flex-col
          justify-between
        "
      >
        {/* Header */}

        <CertificateHeader />

        {/* Body */}

        <div className="text-center flex-1 flex flex-col justify-center">

          <p className="text-2xl text-gray-600">
            This Certificate is Proudly Presented To
          </p>

          <h1 className="text-6xl font-bold uppercase text-amber-700 mt-8">
            {certificate.studentId.name}
          </h1>

          <p className="text-2xl text-gray-600 mt-12">
            For Successfully Completing
          </p>

          <h2 className="text-4xl font-semibold text-gray-800 mt-6 leading-relaxed">
            {certificate.courseId.title}
          </h2>

        </div>

        {/* Footer */}

        <CertificateFooter certificate={certificate} />

      </div>

    </div>
  );
});

export default Certificate;