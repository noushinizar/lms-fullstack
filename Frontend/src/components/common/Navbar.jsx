
import {
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from "react";

import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";
import pageTitles from "../../data/pageTitles";
import api from "../../services/api";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useContext(AuthContext);

  // Profile dropdown
  const [open, setOpen] = useState(false);

  // CRM notifications dropdown
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const [notificationActionError, setNotificationActionError] = useState("");

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

 

  // Only admission counselors can see and use CRM notifications.
  const canViewNotifications = user?.role === "admission_counselor";


  // ===============================
  // FIND CURRENT PAGE TITLE
  // ===============================

  const getPageTitle = () => {
    const currentPath = location.pathname;

    if (pageTitles[currentPath]) {
      return pageTitles[currentPath];
    }

    const matchedPage = Object.entries(pageTitles).find(([path]) => {
      const pathParts = path.split("/");
      const currentParts = currentPath.split("/");

      if (pathParts.length !== currentParts.length) {
        return false;
      }

      return pathParts.every((part, index) => {
        if (part.startsWith(":")) {
          return true;
        }

        return part === currentParts[index];
      });
    });

    if (matchedPage) {
      return matchedPage[1];
    }

    return {
      title: "Dashboard",
      subtitle: "Welcome to Astrobyte LMS",
    };
  };

  const page = getPageTitle();

  // ===============================
  // FETCH CRM NOTIFICATIONS
  // ===============================

  const fetchNotifications = useCallback(async () => {
    if (!canViewNotifications) return;

    try {
      const response = await api.get("/notifications");

      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
      setNotificationError("");
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotificationError("Unable to load notifications. Please try again.");
    }
  }, [canViewNotifications]);

  useEffect(() => {
    // Do not make notification requests for students or mentors.
    if (!canViewNotifications) {
      setNotifications([]);
      setUnreadCount(0);
      setNotificationsOpen(false);
      return undefined;
    }

    fetchNotifications();

    // Refresh the unread count periodically while the user is signed in.
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [canViewNotifications, fetchNotifications]);

  // Close dropdowns when clicking outside them.
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // ===============================
  // NOTIFICATION ACTIONS
  // ===============================

  const handleNotificationToggle = async () => {
    const nextOpen = !notificationsOpen;

    setNotificationsOpen(nextOpen);
    setOpen(false);
    setNotificationActionError("");

    if (nextOpen) {
      setLoadingNotifications(true);

      try {
        await fetchNotifications();
      } finally {
        setLoadingNotifications(false);
      }
    }
  };

  const handleMarkRead = async (notificationId) => {
    const notification = notifications.find(
      (item) => item._id === notificationId
    );

    if (!notification || notification.isRead) return;

    try {
      setNotificationActionError("");

      await api.patch(`/notifications/${notificationId}/read`);

      setNotifications((current) =>
        current.map((item) =>
          item._id === notificationId
            ? { ...item, isRead: true }
            : item
        )
      );

      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      setNotificationActionError("Could not update this notification.");
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;

    try {
      setNotificationActionError("");

      await api.patch("/notifications/read-all");

      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          isRead: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
      setNotificationActionError("Could not update your notifications.");
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await handleMarkRead(notification._id);
    }

    setNotificationsOpen(false);

    // Open the lead if this notification is linked to one.
    if (notification.lead?._id) {
      navigate(`/crm/leads/${notification.lead._id}`);
    } else {
      navigate("/crm/leads");
    }
  };

  const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleString([], {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // ===============================
  // LOGOUT
  // ===============================

  const handleLogout = () => {
    setOpen(false);
    setNotificationsOpen(false);
    logout();
    navigate("/login");
  };

  // ===============================
  // NAVBAR UI
  // ===============================

  return (
    <div className="sticky top-0 z-40 w-full border-b border-gray-800 bg-gray-900 px-4 py-4 text-white shadow-sm sm:px-8">
      <div className="flex items-center justify-between gap-4">

        {/* ================= PAGE TITLE ================= */}

        <div className="min-w-0">
          <h1 className="text-xl font-bold sm:text-2xl">
            {page.title}
          </h1>

          <p className="text-sm text-gray-400">
            {page.subtitle}
          </p>
        </div>

        {/* ================= RIGHT SECTION ================= */}

        <div className="flex shrink-0 items-center gap-4 sm:gap-6">

          {/* ================= CRM NOTIFICATIONS ================= */}

          {canViewNotifications && (
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={handleNotificationToggle}
                aria-label={`Notifications, ${unreadCount} unread`}
                aria-expanded={notificationsOpen}
                title="Notifications"
                className="relative rounded-lg p-2 transition hover:bg-gray-800 hover:text-amber-400"
              >
                <Bell size={22} />

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {/* NOTIFICATION DROPDOWN */}

              {notificationsOpen && (
                <div className="absolute right-0 top-12 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-gray-700 bg-gray-900 shadow-2xl">

                  {/* HEADER */}

                  <div className="flex items-center justify-between gap-2 border-b border-gray-700 px-4 py-3">
                    <div>
                      <h2 className="font-semibold text-white">
                        Notifications
                      </h2>

                      <p className="text-xs text-gray-400">
                        {unreadCount} unread
                      </p>
                    </div>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="flex shrink-0 items-center gap-1 text-xs text-amber-400 hover:text-amber-300"
                      >
                        <CheckCheck size={15} />
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* CONTENT */}

                  <div className="max-h-96 overflow-y-auto">
                    {notificationError && (
                      <div className="px-4 py-3">
                        <p className="text-sm text-red-400">
                          {notificationError}
                        </p>

                        <button
                          type="button"
                          onClick={async () => {
                            setLoadingNotifications(true);
                            try {
                              await fetchNotifications();
                            } finally {
                              setLoadingNotifications(false);
                            }
                          }}
                          className="mt-2 text-xs text-amber-400 hover:text-amber-300"
                        >
                          Try again
                        </button>
                      </div>
                    )}

                    {notificationActionError && (
                      <p className="px-4 py-2 text-xs text-red-400">
                        {notificationActionError}
                      </p>
                    )}

                    {loadingNotifications ? (
                      <p className="px-4 py-6 text-center text-sm text-gray-400">
                        Loading notifications...
                      </p>
                    ) : notifications.length === 0 && !notificationError ? (
                      <div className="px-4 py-8 text-center">
                        <Bell
                          size={28}
                          className="mx-auto mb-2 text-gray-600"
                        />

                        <p className="text-sm text-gray-300">
                          You're all caught up!
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          New follow-up reminders will appear here.
                        </p>
                      </div>
                    ) : (
                      notifications.map((notification) => {
                        const isOverdue =
                          notification.type === "follow_up_overdue";

                        return (
                          <div
                            key={notification._id}
                            className={`border-b border-gray-800 transition hover:bg-gray-800 ${
                              !notification.isRead ? "bg-gray-800/50" : ""
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                handleNotificationClick(notification)
                              }
                              className="w-full px-4 py-3 text-left"
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`mt-0.5 rounded-full p-2 ${
                                    isOverdue
                                      ? "bg-red-500/10 text-red-400"
                                      : "bg-amber-500/10 text-amber-400"
                                  }`}
                                >
                                  {isOverdue ? (
                                    <AlertCircle size={17} />
                                  ) : (
                                    <Clock size={17} />
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-semibold text-white">
                                      {notification.title}
                                    </p>

                                    {!notification.isRead && (
                                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                                    )}
                                  </div>

                                  <p className="mt-1 text-sm leading-5 text-gray-300">
                                    {notification.message}
                                  </p>

                                  {notification.lead?.name && (
                                    <p className="mt-1 text-xs text-amber-400">
                                      Lead: {notification.lead.name}
                                    </p>
                                  )}

                                  <p className="mt-2 text-xs text-gray-500">
                                    {formatDate(notification.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </button>

                            {!notification.isRead && (
                              <div className="px-4 pb-2 pl-14">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleMarkRead(notification._id)
                                  }
                                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-amber-400"
                                >
                                  <Check size={14} />
                                  Mark as read
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* FOOTER */}

                  <button
                    type="button"
                    onClick={() => {
                      setNotificationsOpen(false);
                      navigate("/crm/leads");
                    }}
                    className="w-full border-t border-gray-700 px-4 py-3 text-sm font-medium text-amber-400 transition hover:bg-gray-800"
                  >
                    View leads and follow-ups
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= PROFILE ================= */}

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setOpen(!open);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-3"
            >
              {/* Avatar */}

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-linear-to-r
                  from-amber-500
                  to-orange-500
                  font-bold
                  text-white
                  shadow-md
                "
              >
                {user?.name?.charAt(0).toUpperCase()}
              </div>

              {/* User Information */}

              <div className="hidden text-left sm:block">
                <h3 className="font-semibold">
                  {user?.name}
                </h3>

                <p className="text-xs capitalize text-gray-400">
                  {user?.role?.replaceAll("_", " ")}
                </p>
              </div>
            </button>

            {/* PROFILE DROPDOWN */}

            {open && (
              <div className="absolute right-0 top-12 z-50 w-40 overflow-hidden rounded-lg border border-gray-700 bg-gray-900 shadow-xl">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-sm text-gray-200 transition hover:bg-gray-800 hover:text-amber-400"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Navbar;
