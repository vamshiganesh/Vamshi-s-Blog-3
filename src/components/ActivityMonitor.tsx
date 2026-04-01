import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PersonStanding, Footprints, Armchair, AlertCircle, Clock } from "lucide-react";

type ActivityState = "walking" | "standing" | "sitting" | "resting";

const activityConfig: Record<ActivityState, { icon: React.ReactNode; label: string; color: string; bgColor: string }> = {
  walking: { icon: <Footprints className="w-8 h-8" />, label: "Walking", color: "text-success", bgColor: "bg-success/10" },
  standing: { icon: <PersonStanding className="w-8 h-8" />, label: "Standing", color: "text-warning", bgColor: "bg-warning/10" },
  sitting: { icon: <Armchair className="w-8 h-8" />, label: "Sitting", color: "text-info", bgColor: "bg-info/10" },
  resting: { icon: <Armchair className="w-8 h-8" />, label: "Resting", color: "text-voice", bgColor: "bg-voice/10" },
};

const ActivityMonitor = () => {
  const [activity, setActivity] = useState<ActivityState>("sitting");
  const [duration, setDuration] = useState(0);
  const [alert, setAlert] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setDuration((d) => d + 1);
    }, 60000); // every minute
    return () => clearInterval(timer);
  }, [activity]);

  // Alert if standing > 30 min (simulate with lower threshold)
  useEffect(() => {
    if (activity === "standing" && duration > 2) {
      setAlert(true);
    } else {
      setAlert(false);
    }
  }, [activity, duration]);

  const changeActivity = (newActivity: ActivityState) => {
    setActivity(newActivity);
    setDuration(0);
  };

  const config = activityConfig[activity];

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
        <Clock className="w-5 h-5 text-warning" />
        Activity Monitor
      </h2>

      {/* Current activity */}
      <motion.div
        key={activity}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`${config.bgColor} p-5 rounded-xl flex items-center gap-4`}
      >
        <span className={config.color}>{config.icon}</span>
        <div>
          <p className={`font-heading font-bold text-xl ${config.color}`}>{config.label}</p>
          <p className="text-sm text-muted-foreground">For {duration} min</p>
        </div>
      </motion.div>

      {alert && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-warning/10 border border-warning/30 p-3 rounded-lg flex items-center gap-2"
        >
          <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
          <p className="text-sm text-warning font-body font-medium">
            Standing too long! Consider sitting down or taking a walk.
          </p>
        </motion.div>
      )}

      {/* Activity selectors */}
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(activityConfig) as ActivityState[]).map((key) => {
          const ac = activityConfig[key];
          return (
            <button
              key={key}
              onClick={() => changeActivity(key)}
              className={`p-3 rounded-lg flex items-center gap-2 transition-all text-sm font-body font-medium ${
                activity === key
                  ? `${ac.bgColor} ${ac.color} ring-2 ring-current`
                  : "bg-card text-muted-foreground hover:bg-secondary"
              }`}
            >
              {ac.icon}
              {ac.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityMonitor;
