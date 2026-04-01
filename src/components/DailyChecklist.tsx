import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, Pill, UtensilsCrossed, Footprints, Droplets, Moon, Heart, Send, Plus, Trash2, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CheckItem {
  id: string;
  label: string;
  icon: "pill" | "meal" | "walk" | "water" | "sleep" | "heart";
  time: string;
  done: boolean;
}

interface Profile {
  id: string;
  name: string;
}

interface ReminderNotificationPayload {
  title: string;
  body: string;
  profileName: string;
  itemLabel: string;
  timeLabel: string;
}

interface DailyChecklistProps {
  onReminderNotification?: (payload: ReminderNotificationPayload) => void;
  onChecklistSnapshot?: (payload: {
    profileName: string;
    items: Array<{ id: string; label: string; time: string; done: boolean }>;
  }) => void;
}

const initialItems: CheckItem[] = [
  { id: "1", label: "Morning Medicine", icon: "pill", time: "8:00 AM", done: false },
  { id: "2", label: "Breakfast", icon: "meal", time: "9:00 AM", done: false },
  { id: "3", label: "Morning Walk", icon: "walk", time: "10:00 AM", done: false },
  { id: "4", label: "Drink Water (8 glasses)", icon: "water", time: "Throughout day", done: false },
  { id: "5", label: "Afternoon Medicine", icon: "pill", time: "2:00 PM", done: false },
  { id: "6", label: "Blood Pressure Check", icon: "heart", time: "4:00 PM", done: false },
  { id: "7", label: "Evening Medicine", icon: "pill", time: "8:00 PM", done: false },
  { id: "8", label: "Bedtime Routine", icon: "sleep", time: "9:30 PM", done: false },
];

const PROFILES_STORAGE_KEY = "guardianProfiles";
const CHECKLIST_STORAGE_KEY = "guardianChecklistByProfile";
const ADMIN_ACCESS_CODE = "GuardianFamily2026";

const normalizeItems = (items: CheckItem[]): CheckItem[] =>
  items.map((item, idx) => ({
    id: item.id || `${Date.now()}-${idx}`,
    label: item.label || "Untitled Task",
    icon: item.icon || "heart",
    time: item.time || "12:00 PM",
    done: Boolean(item.done),
  }));

const iconByType: Record<CheckItem["icon"], React.ReactNode> = {
  pill: <Pill className="w-5 h-5" />,
  meal: <UtensilsCrossed className="w-5 h-5" />,
  walk: <Footprints className="w-5 h-5" />,
  water: <Droplets className="w-5 h-5" />,
  sleep: <Moon className="w-5 h-5" />,
  heart: <Heart className="w-5 h-5" />,
};

const formatCurrentTimeLabel = (date: Date) =>
  date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

const DailyChecklist = ({ onReminderNotification, onChecklistSnapshot }: DailyChecklistProps) => {
  const userName = localStorage.getItem("authUserName") || "Resident";
  const [profiles, setProfiles] = useState<Profile[]>([{ id: "default", name: userName }]);
  const [activeProfileId, setActiveProfileId] = useState("default");
  const [itemsByProfile, setItemsByProfile] = useState<Record<string, CheckItem[]>>({
    default: initialItems,
  });
  const [newProfileName, setNewProfileName] = useState("");
  const [newItemLabel, setNewItemLabel] = useState("");
  const [newItemTime, setNewItemTime] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState("");
  const [adminError, setAdminError] = useState("");
  const notifiedReminderIds = useRef<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    if (window.Notification && Notification.permission === "default") {
      Notification.requestPermission().catch((error) => {
        console.error("Notification permission request failed", error);
      });
    }

    const savedProfiles = localStorage.getItem(PROFILES_STORAGE_KEY);
    const savedChecklist = localStorage.getItem(CHECKLIST_STORAGE_KEY);

    if (savedProfiles) {
      try {
        const parsedProfiles = JSON.parse(savedProfiles) as Profile[];
        if (Array.isArray(parsedProfiles) && parsedProfiles.length > 0) {
          setProfiles(parsedProfiles);
          setActiveProfileId(parsedProfiles[0].id);
        }
      } catch (error) {
        console.error("Failed to parse saved profiles", error);
      }
    }

    if (savedChecklist) {
      try {
        const parsedChecklist = JSON.parse(savedChecklist) as Record<string, CheckItem[]>;
        const normalizedChecklist: Record<string, CheckItem[]> = {};
        Object.keys(parsedChecklist).forEach((key) => {
          normalizedChecklist[key] = normalizeItems(parsedChecklist[key]);
        });
        if (Object.keys(normalizedChecklist).length > 0) {
          setItemsByProfile(normalizedChecklist);
        }
      } catch (error) {
        console.error("Failed to parse saved checklist", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(itemsByProfile));
  }, [itemsByProfile]);

  const activeProfile = useMemo(
    () => profiles.find((profile) => profile.id === activeProfileId) || profiles[0],
    [profiles, activeProfileId],
  );

  const items = itemsByProfile[activeProfile?.id || "default"] || [];

  useEffect(() => {
    if (!activeProfile) {
      return;
    }

    onChecklistSnapshot?.({
      profileName: activeProfile.name,
      items: items.map((item) => ({
        id: item.id,
        label: item.label,
        time: item.time,
        done: item.done,
      })),
    });
  }, [activeProfile, items, onChecklistSnapshot]);

  useEffect(() => {
    if (!activeProfile) {
      return;
    }

    const tick = () => {
      const now = new Date();
      const nowLabel = formatCurrentTimeLabel(now);
      const dateKey = now.toISOString().slice(0, 10);

      items.forEach((item) => {
        const reminderKey = `${activeProfile.id}:${dateKey}:${item.id}`;
        const shouldNotify = !item.done && item.time === nowLabel;

        if (!shouldNotify || notifiedReminderIds.current.has(reminderKey)) {
          return;
        }

        notifiedReminderIds.current.add(reminderKey);
        const payload: ReminderNotificationPayload = {
          title: "Checklist Reminder",
          body: `${activeProfile.name}: ${item.label} (${item.time})`,
          profileName: activeProfile.name,
          itemLabel: item.label,
          timeLabel: item.time,
        };

        onReminderNotification?.(payload);

        if (window.Notification && Notification.permission === "granted") {
          new Notification(payload.title, { body: payload.body });
        }

        toast({
          title: payload.title,
          description: payload.body,
        });
      });
    };

    tick();
    const interval = window.setInterval(tick, 30_000);
    return () => window.clearInterval(interval);
  }, [items, activeProfile, onReminderNotification, toast]);

  const updateItemsForActiveProfile = (updater: (current: CheckItem[]) => CheckItem[]) => {
    if (!activeProfile) {
      return;
    }

    setItemsByProfile((prev) => ({
      ...prev,
      [activeProfile.id]: updater(prev[activeProfile.id] || []),
    }));
  };

  const sendDemoReminder = async () => {
    try {
      const telegramToken = "8367204813:AAFhSRWxBC9VYDDGj_2YrbKl_84SFry30vg";
      const chatId = "8507257605";
      const completedItems = items.filter((item) => item.done).map((item) => item.label);
      const pendingItems = items.filter((item) => !item.done).map((item) => `${item.label} (${item.time})`);
      const message = [
        `Guardian checklist update for ${activeProfile?.name || "Resident"}`,
        "",
        `Done (${completedItems.length}):`,
        completedItems.length > 0 ? completedItems.join(", ") : "None yet",
        "",
        `Remaining (${pendingItems.length}):`,
        pendingItems.length > 0 ? pendingItems.join(", ") : "All reminders completed",
      ].join("\n");
      
      const response = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
      });
      
      if (response.ok) {
        toast({
          title: "Reminder Sent",
          description: "Checklist summary with done and pending items sent via Telegram.",
        });
      } else {
        toast({
          title: "Failed",
          description: "Could not send reminder.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toggle = (id: string) => {
    updateItemsForActiveProfile((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
    );
  };

  const updateItem = (id: string, key: "label" | "time", value: string) => {
    updateItemsForActiveProfile((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    );
  };

  const removeItem = (id: string) => {
    updateItemsForActiveProfile((prev) => prev.filter((item) => item.id !== id));
  };

  const addItem = () => {
    if (!newItemLabel.trim() || !newItemTime.trim()) {
      toast({
        title: "Missing details",
        description: "Please add both task name and reminder time.",
        variant: "destructive",
      });
      return;
    }

    const createdItem: CheckItem = {
      id: `${Date.now()}`,
      label: newItemLabel.trim(),
      time: newItemTime.trim(),
      done: false,
      icon: "heart",
    };

    updateItemsForActiveProfile((prev) => [...prev, createdItem]);
    setNewItemLabel("");
    setNewItemTime("");
  };

  const addProfile = () => {
    if (!newProfileName.trim()) {
      return;
    }

    const id = `${Date.now()}`;
    const profile: Profile = { id, name: newProfileName.trim() };

    setProfiles((prev) => [...prev, profile]);
    setItemsByProfile((prev) => ({
      ...prev,
      [id]: initialItems.map((item, idx) => ({ ...item, id: `${Date.now()}-${idx}`, done: false })),
    }));
    setActiveProfileId(id);
    setNewProfileName("");
  };

  const completedCount = items.filter((i) => i.done).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  const openSettings = () => {
    setSettingsOpen(true);
    setAdminUnlocked(false);
    setAdminPassInput("");
    setAdminError("");
  };

  const closeSettings = () => {
    setSettingsOpen(false);
    setAdminUnlocked(false);
    setAdminPassInput("");
    setAdminError("");
  };

  const unlockAdmin = () => {
    if (adminPassInput !== ADMIN_ACCESS_CODE) {
      setAdminError("Incorrect password. Please try again.");
      return;
    }
    setAdminUnlocked(true);
    setAdminError("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-bold" style={{ color: "#E0E0E0" }}>Today's Timeline</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={sendDemoReminder} className="h-[60px] px-5">
            <Send className="w-4 h-4 mr-2" />
            Demo Reminder
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={openSettings}
            className="h-[60px] px-5"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <span className="text-sm font-body text-muted-foreground">
            {completedCount}/{items.length} done
          </span>
        </div>
      </div>

      {settingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="w-full max-w-3xl rounded-2xl border border-white/20 bg-slate-950 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-heading font-bold" style={{ color: "#E0E0E0" }}>Admin / Family Settings</h3>
              <Button variant="outline" onClick={closeSettings} className="h-[60px] px-5">Close</Button>
            </div>

            {!adminUnlocked ? (
              <div className="space-y-3">
                <p className="text-base" style={{ color: "#E0E0E0" }}>
                  Enter admin password to manage profiles and tasks.
                </p>
                <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                  <Input
                    type="password"
                    placeholder="Admin password"
                    value={adminPassInput}
                    onChange={(event) => setAdminPassInput(event.target.value)}
                    className="h-[60px]"
                  />
                  <Button onClick={unlockAdmin} className="h-[60px] px-6">Unlock</Button>
                </div>
                {adminError && <p className="text-sm text-red-300">{adminError}</p>}
              </div>
            ) : (
              <>
                <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                  <div className="flex flex-wrap gap-2">
                    {profiles.map((profile) => (
                      <Button
                        key={profile.id}
                        variant={profile.id === activeProfile?.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveProfileId(profile.id)}
                        className="h-[60px] px-5"
                      >
                        {profile.name}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add profile"
                      value={newProfileName}
                      onChange={(event) => setNewProfileName(event.target.value)}
                      className="h-[60px]"
                    />
                    <Button variant="outline" size="sm" onClick={addProfile} className="h-[60px] px-5">
                      <Plus className="w-4 h-4 mr-1" />
                      Profile
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2 md:grid-cols-[1fr_180px_auto]">
                  <Input
                    placeholder="Task name"
                    value={newItemLabel}
                    onChange={(event) => setNewItemLabel(event.target.value)}
                    className="h-[60px]"
                  />
                  <Input
                    placeholder="Time (e.g. 6:30 PM)"
                    value={newItemTime}
                    onChange={(event) => setNewItemTime(event.target.value)}
                    className="h-[60px]"
                  />
                  <Button onClick={addItem} className="h-[60px] px-5">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-success rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative pl-6"
          >
            <span className="absolute left-1 top-0 h-full w-[2px] bg-white/20" />
            <div className="absolute left-0 top-8 h-2 w-2 rounded-full bg-cyan-200" />
            <button
              onClick={() => toggle(item.id)}
              className={`w-full min-h-[60px] flex items-center gap-4 rounded-xl border p-4 transition-all text-left ${
                item.done ? "border-emerald-300/40 bg-emerald-200/20" : "border-white/15 bg-slate-900/65 hover:bg-slate-800/70"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  item.done ? "bg-success" : "bg-secondary"
                }`}
              >
                {item.done ? (
                  <Check className="w-4 h-4 text-success-foreground" />
                ) : (
                  <span className="text-muted-foreground">{iconByType[item.icon]}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-heading text-xl ${item.done ? "line-through text-slate-300" : "text-[#E0E0E0]"}`}>{item.label}</p>
                <p className="text-sm text-slate-300">{item.time}</p>
              </div>
              <span className={`text-xs rounded-full px-3 py-1 ${item.done ? "bg-emerald-300/20 text-emerald-100" : "bg-amber-300/20 text-amber-100"}`}>
                {item.done ? "Done" : "Pending"}
              </span>
            </button>

            {settingsOpen && adminUnlocked && (
              <div className="mt-2 grid gap-2 rounded-xl border border-white/10 bg-black/20 p-2 md:grid-cols-[1fr_160px_auto]">
                <Input
                  value={item.label}
                  onChange={(event) => updateItem(item.id, "label", event.target.value)}
                  className="h-[60px]"
                />
                <Input
                  value={item.time}
                  onChange={(event) => updateItem(item.id, "time", event.target.value)}
                  className="h-[60px]"
                />
                <Button
                  variant="ghost"
                  onClick={() => removeItem(item.id)}
                  className="h-[60px]"
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground mr-2" />
                  Remove
                </Button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DailyChecklist;
