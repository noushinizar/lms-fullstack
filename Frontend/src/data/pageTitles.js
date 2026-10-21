const pageTitles = {
  // Student
  "/student/dashboard": {
    title: "Dashboard",
    subtitle: "Track your learning progress and continue learning.",
  },

  "/student/courses": {
    title: "Explore Courses",
    subtitle: "Browse and enroll in new courses.",
  },

  "/student/my-courses": {
    title: "My Learning",
    subtitle: "Continue your enrolled courses.",
  },

  "/student/course/:id": {
    title: "Explore Your Learning",
    subtitle: "Explore your lessons, assignments, quizzes, and progress.",
  },

  "/student/course/:id/lessons": {
    title: "Lessons",
    subtitle: "Access and complete your course lessons.",
  },

  "/student/course/:id/assignments": {
    title: "Assignments",
    subtitle: "View and submit your course assignments.",
  },

  "/student/course/:id/quizzes": {
    title: "Quizzes",
    subtitle: "Take quizzes and test your knowledge.",
  },

  "/student/course/:id/progress": {
    title: "Progress",
    subtitle: "Track your learning progress in this course.",
  },

  "/student/my-submissions": {
    title: "My Submissions",
    subtitle: "Track your submitted assignments.",
  },

  "/student/certificates": {
    title: "Certificates",
    subtitle: "Download and manage your certificates.",
  },

  "/student/profile": {
    title: "Profile",
    subtitle: "Manage your personal information and account.",
  },

  "/student/live-classes": {
    title: "Live Classes",
    subtitle: "Join your upcoming live sessions.",
  },

  // Mentor
  "/mentor/dashboard": {
    title: "Dashboard",
    subtitle: "Manage your courses and students.",
  },

  "/mentor/courses": {
    title: "Courses",
    subtitle: "Manage your assigned courses.",
  },

  "/mentor/course/:id": {
    title: "Course Details",
    subtitle: "Manage lessons, quizzes and assignments.",
  },

  "/mentor/quizzes/:quizId": {
    title: "Questions",
    subtitle: "Manage questions.",
  },

  "/mentor/live-classes": {
    title: "Live Classes",
    subtitle: "Manage your live classes and sessions.",
  },

  "/mentor/profile": {
    title: "Profile",
    subtitle: "Manage your mentor account.",
  },

  // Admin
  "/admin/dashboard": {
    title: "Dashboard",
    subtitle: "Monitor and manage the entire LMS platform.",
  },

  "/admin/enrollments": {
    title: "Enrollment Requests",
    subtitle: "Review and manage student enrollment requests.",
  },

  "/admin/courses": {
    title: "Courses",
    subtitle: "Manage all courses in the platform.",
  },

  "/admin/live-classes": {
    title: "Live Classes",
    subtitle: "Manage live classes across the LMS platform.",
  },

  "/admin/people": {
    title: "People",
    subtitle: "Manage students, mentors, and administrators.",
  },

  "/admin/counselors": {
    title: "Admission Counselors",
    subtitle: "Manage counselors responsible for student enquiries and admissions.",
  },

  "/admin/profile": {
    title: "Profile",
    subtitle: "Manage your administrator account.",
  },

  "/admin/settings": {
    title: "Settings",
    subtitle: "Configure your LMS platform.",
  },

  // CRM
  "/crm/dashboard": {
    title: "CRM Dashboard",
    subtitle: "Track enquiries, follow-ups, and admission conversions.",
  },

  "/crm/leads": {
    title: "Leads",
    subtitle: "Manage enquiries, interested students, and admission follow-ups.",
  },

  "/crm/leads/:id": {
    title: "Lead Details",
    subtitle: "View and update enquiry information, status, and follow-up details.",
  },

   "/crm/workload": {
    title: "Counselor Workload",
    subtitle: "Monitor counselor assignments, follow-up performance, and admission conversions.",
  },
};

export default pageTitles;