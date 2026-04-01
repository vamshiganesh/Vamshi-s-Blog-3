import { useMemo, useState } from "react";
import ActivityMonitor from "@/components/ActivityMonitor";
import CompanionChat from "@/components/CompanionChat";
import DailyChecklist from "@/components/DailyChecklist";
import FallDetectionPanel from "@/components/FallDetectionPanel";
import RelativeEmailManager from "@/components/RelativeEmailManager";
import SOSButton from "@/components/SOSButton";
import VoiceAssistant from "@/components/VoiceAssistant";
import { Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardNotification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("authUserName") || "Resident";
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUserName");
    navigate("/login");
  };

  const handleReminderNotification = (payload: {
    title: string;
    body: string;
    profileName: string;
    itemLabel: string;
    timeLabel: string;
  }) => {
    setNotifications((prev) => [
      {
        id: `${Date.now()}`,
        title: payload.title,
        body: payload.body,
        createdAt: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        read: false,
      },
      ...prev,
    ]);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen((prev) => {
      const next = !prev;
      if (!prev) {
        setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70 bg-card/70">
        <div className="container flex flex-wrap items-center justify-between gap-4 py-4">
          <div>
            <h1 className="text-2xl font-heading font-extrabold">Guardian Companion Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {userName}</p>
          </div>
          <div className="relative flex items-center gap-3">
            <button
              onClick={toggleNotifications}
              className="relative inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
            >
              <Bell className="h-4 w-4" />
              Notifications
              {unreadCount > 0 && (
                <span className="rounded-full bg-destructive px-2 py-0.5 text-xs text-white">{unreadCount}</span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 top-12 z-20 w-80 rounded-xl border border-border bg-card p-3 shadow-xl">
                <p className="mb-2 text-sm font-semibold">Reminder Notifications</p>
                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No notifications yet.</p>
                  ) : (
                    notifications.map((notification) => (
                      <div key={notification.id} className="rounded-lg border border-border/70 bg-background p-2">
                        <p className="text-sm font-semibold">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.body}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{notification.createdAt}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container space-y-6 py-6">
        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <DailyChecklist onReminderNotification={handleReminderNotification} />
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <SOSButton />
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <FallDetectionPanel />
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <ActivityMonitor />
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <RelativeEmailManager />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <CompanionChat />
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <VoiceAssistant />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
