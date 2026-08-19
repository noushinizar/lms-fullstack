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

"/mentor/quizzes/:quizId" :{
  title: "Questions",
  subtitle: "Manage questions.",
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

  "/admin/courses": {
    title: "Courses",
    subtitle: "Manage all courses in the platform.",
  },

  "/admin/people": {
  title: "People",
  subtitle: "Manage students, mentors, and administrators.",
},

  "/admin/profile": {
    title: "Profile",
    subtitle: "Manage your administrator account.",
  },

  "/admin/settings": {
    title: "Settings",
    subtitle: "Configure your LMS platform.",
  },
};

export default pageTitles;