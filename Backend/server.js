import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import adminEnrollmentRoutes from "./routes/adminEnrollmentRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import assignmentSubmissionRoutes from "./routes/assignmentSubmissionRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import communicationRoutes from "./routes/communicationRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import courseProgressRoutes from "./routes/courseProgressRoutes.js";
import studentDashboardRoutes from "./routes/studentDashboardRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import mentorDashboardRoutes from "./routes/mentorDashboardRoutes.js";

dotenv.config();

connectDB();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/courses", courseRoutes);

app.use("/api/lessons", lessonRoutes);

app.use("/api/admin/enrollments", adminEnrollmentRoutes);

app.use("/api/enrollment", enrollmentRoutes);

app.use("/api/progress", progressRoutes);

app.use("/api/assignments", assignmentRoutes);

app.use("/api/submissions", assignmentSubmissionRoutes);

app.use("/api/quizzes", quizRoutes);

app.use("/api/questions", questionRoutes);

app.use("/api/course-progress", courseProgressRoutes);

app.use("/api/student/dashboard", studentDashboardRoutes);

app.use("/api/mentor/dashboard", mentorDashboardRoutes);

app.use("/api/student/certificates", certificateRoutes);

app.use("/api/profile", profileRoutes);

app.use("/api/communication", communicationRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("LMS API Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

