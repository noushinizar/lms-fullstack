import Certificate from "../models/Certificate.js";
import { generateCertificate } from "../services/certificate/certificateService.js";
import { generateCertificatePDF } from "../services/certificate/certificatePdfService.js";

// Generate Certificate
export const createCertificate = async (req, res) => {
  try {
    const studentId = req.user._id;
    const courseId = req.params.courseId;

    const certificate = await generateCertificate(
      studentId,
      courseId
    );

    res.status(201).json({
      message: "Certificate generated successfully.",
      certificate,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// Get all certificates of logged-in student
export const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({
      studentId: req.user._id,
    })
      .populate("courseId", "title thumbnail")
      .sort({ issuedAt: -1 });

    res.json(certificates);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get certificate of a particular course
export const getCertificateByCourse = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      studentId: req.user._id,
      courseId: req.params.courseId,
    })
      .populate("studentId", "name")
      .populate("courseId", "title thumbnail");

    if (!certificate) {
      return res.status(404).json({
        message: "Certificate not found.",
      });
    }

    res.json(certificate);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// Public Certificate Verification
export const verifyCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      certificateId: req.params.certificateId,
    })
      .populate("studentId", "name")
      .populate("courseId", "title");

    if (!certificate) {
      return res.status(404).json({
        valid: false,
        message: "Certificate not found.",
      });
    }

    res.json({
      valid: true,
      certificate,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


export const downloadCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      studentId: req.user._id,
      courseId: req.params.courseId,
    })
      .populate("studentId", "name")
      .populate("courseId", "title");

    if (!certificate) {
      return res.status(404).json({
        message: "Certificate not found.",
      });
    }

    const pdf = await generateCertificatePDF(
      certificate
    );

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition":
        `attachment; filename=${certificate.certificateId}.pdf`,
    });

    res.send(pdf);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};