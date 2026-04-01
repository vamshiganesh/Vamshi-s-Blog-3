import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, Pill, UtensilsCrossed, Footprints, Droplets, Moon, Heart, Send, Plus, Trash2 } from "lucide-react";
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

const DailyChecklist = ({ onReminderNotification }: DailyChecklistProps) => {
  const userName = localStorage.getItem("authUserName") || "Resident";
  const [profiles, setProfiles] = useState<Profile[]>([{ id: "default", name: userName }]);
  const [activeProfileId, setActiveProfileId] = useState("default");
  const [itemsByProfile, setItemsByProfile] = useState<Record<string, CheckItem[]>>({
    default: initialItems,
  });
  const [newProfileName, setNewProfileName] = useState("");
  const [newItemLabel, setNewItemLabel] = useState("");
  const [newItemTime, setNewItemTime] = useState("");
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-bold text-foreground">Today's Checklist</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={sendDemoReminder}>
            <Send className="w-4 h-4 mr-2" />
            Demo Reminder
          </Button>
          <span className="text-sm font-body text-muted-foreground">
            {completedCount}/{items.length} done
          </span>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-[1fr_auto]">
        <div className="flex flex-wrap gap-2">
          {profiles.map((profile) => (
            <Button
              key={profile.id}
              variant={profile.id === activeProfile?.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveProfileId(profile.id)}
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
            className="h-9"
          />
          <Button variant="outline" size="sm" onClick={addProfile}>
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
        />
        <Input
          placeholder="Time (e.g. 6:30 PM)"
          value={newItemTime}
          onChange={(event) => setNewItemTime(event.target.value)}
        />
        <Button onClick={addItem}>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-success rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {items.map((item, i) => (
          <motion.button
            key={item.id}
            onClick={() => toggle(item.id)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`w-full flex items-center gap-4 p-4 rounded-lg transition-all text-left ${
              item.done
                ? "bg-accent/60 opacity-70"
                : "bg-card hover:bg-secondary"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                item.done ? "bg-success" : "bg-secondary"
              }`}
            >
              {item.done ? (
                <Check className="w-4 h-4 text-success-foreground" />
              ) : (
                <span className="text-muted-foreground">{iconByType[item.icon]}</span>
              )}
            </div>
            <div className="flex-1 min-w-0 grid gap-1 md:grid-cols-[1fr_140px]">
              <Input
                value={item.label}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => updateItem(item.id, "label", event.target.value)}
                className={`${item.done ? "line-through" : ""}`}
              />
              <Input
                value={item.time}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => updateItem(item.id, "time", event.target.value)}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(event) => {
                event.stopPropagation();
                removeItem(item.id);
              }}
            >
              <Trash2 className="w-4 h-4 text-muted-foreground" />
            </Button>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default DailyChecklist;
