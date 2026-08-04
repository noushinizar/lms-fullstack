import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Trophy,
  ClipboardList,
  Video,
  User,
  Users,
  FileQuestion,
  FileText,
  Settings,
  LogOut,
  UserPlus,
} from "lucide-react";

export const sidebarMenus = {
  student: [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/student/dashboard",
    },
    {
      name: "Explore Courses",
      icon: BookOpen,
      path: "/student/courses",
    },
    {
      name: "My Learning",
      icon: GraduationCap,
      path: "/student/my-courses",
    },
    {
      name: "Certificates",
      icon: Trophy,
      path: "/student/certificates",
    },
    {
      name: "Submissions",
      icon: ClipboardList,
      path: "/student/my-submissions",
    },
    {
      name: "Live Classes",
      icon: Video,
      path: "/live-classes",
    },
    {
      name: "Profile",
      icon: User,
      path: "/student/profile",
    },
    {
      name: "Logout",
      icon: LogOut,
      path: "/login",
    },
  ],

  mentor: [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/mentor/dashboard",
    },
    {
      name: "Courses",
      icon: BookOpen,
      path: "/mentor/courses",
    },
    {
      name: "Profile",
      icon: User,
      path: "/mentor/profile",
    },
    {
      name: "Logout",
      icon: LogOut,
      path: "/login",
    },
  ],

  admin: [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },
    {
      name: "Enrollment Requests",
      path: "/admin/enrollments",
      icon: UserPlus,
    },
    {
      name: "Courses",
      icon: BookOpen,
      path: "/admin/courses",
    },
    {
      name: "People",
      icon: Users,
      path: "/admin/people",
    },
    {
      name: "Profile",
      icon: User,
      path: "/admin/profile",
    },
    {
      name: "Logout",
      icon: LogOut,
      path: "/login",
    },
  ],
};
