import { getDashboardData } from "../services/mentorDashboardService.js";

export const getMentorDashboard = async (req, res) => {
  try {
    const data = await getDashboardData(req.user.id);
    res.json(data);
    
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};