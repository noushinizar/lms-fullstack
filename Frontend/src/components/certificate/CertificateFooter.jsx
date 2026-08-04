import signature from "../../assets/certificate/signature.png";
import { BRANDING } from "../../constants/branding";

const CertificateFooter = ({ certificate }) => {
  return (
    <div className="mt-24">

      <div className="grid grid-cols-2 gap-10 items-end">

        {/* Left */}

        <div>

          <p className="text-gray-500 text-sm">
            Certificate ID
          </p>

          <p className="font-semibold text-lg">
            {certificate.certificateId}
          </p>

          <p className="text-gray-500 text-sm mt-6">
            Issued On
          </p>

          <p className="font-medium">
            {new Date(
              certificate.issuedAt
            ).toLocaleDateString()}
          </p>

        </div>

        {/* Right */}

        <div className="text-center">

          <img
            src={signature}
            alt="Director Signature"
            className="w-44 mx-auto"
          />

          <div className="border-t border-gray-400 w-48 mx-auto pt-2">

            <p className="font-semibold">
              {BRANDING.directorName}
            </p>

            <p className="text-gray-500">
              {BRANDING.directorTitle}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default CertificateFooter;

