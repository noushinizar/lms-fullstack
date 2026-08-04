import logo from "../../assets/certificate/logo.png";
import { BRANDING } from "../../constants/branding";

const CertificateHeader = () => {
  return (
    <div className="text-center">

      {/* Logo */}

      <img
        src={logo}
        alt="Astrobyte Academy"
        className="w-24 h-24 object-contain mx-auto"
      />

      {/* Academy Name */}

      <h2 className="mt-4 text-2xl font-bold tracking-[0.35em] uppercase text-amber-700">
        {BRANDING.academyName}
      </h2>

      {/* Certificate Title */}

      <h1 className="mt-8 text-5xl font-serif font-bold text-gray-800">
        Certificate of Completion
      </h1>

      <div className="w-40 h-1 bg-amber-700 mx-auto rounded-full mt-6"></div>

    </div>
  );
};

export default CertificateHeader;


