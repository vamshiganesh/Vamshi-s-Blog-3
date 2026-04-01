import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Activity, AlertTriangle, CheckCircle } from "lucide-react";

const FallDetectionPanel = () => {
  const [status, setStatus] = useState<"monitoring" | "alert" | "safe">("monitoring");
  const [accelData, setAccelData] = useState({ x: 0.02, y: 9.81, z: 0.01 });

  // Simulate accelerometer data
  useEffect(() => {
    const interval = setInterval(() => {
      setAccelData({
        x: parseFloat((Math.random() * 0.1 - 0.05).toFixed(3)),
        y: parseFloat((9.78 + Math.random() * 0.06).toFixed(3)),
        z: parseFloat((Math.random() * 0.1 - 0.05).toFixed(3)),
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const statusConfig = {
    monitoring: { icon: <Shield className="w-6 h-6" />, label: "Monitoring", color: "bg-primary", textColor: "text-primary-foreground" },
    alert: { icon: <AlertTriangle className="w-6 h-6" />, label: "Fall Detected!", color: "bg-sos", textColor: "text-sos-foreground" },
    safe: { icon: <CheckCircle className="w-6 h-6" />, label: "All Clear", color: "bg-success", textColor: "text-success-foreground" },
  };

  const config = statusConfig[status];

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary" />
        Fall Detection
      </h2>

      <motion.div
        className={`${config.color} p-4 rounded-xl flex items-center gap-3`}
        animate={{ scale: status === "alert" ? [1, 1.02, 1] : 1 }}
        transition={{ repeat: status === "alert" ? Infinity : 0, duration: 1 }}
      >
        <span className={config.textColor}>{config.icon}</span>
        <div>
          <p className={`font-heading font-bold text-lg ${config.textColor}`}>{config.label}</p>
          <p className={`text-sm ${config.textColor} opacity-80`}>
            AI-powered motion analysis active
          </p>
        </div>
      </motion.div>

      {/* Sensor data */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { axis: "X", val: accelData.x },
          { axis: "Y", val: accelData.y },
          { axis: "Z", val: accelData.z },
        ].map(({ axis, val }) => (
          <div key={axis} className="bg-card p-3 rounded-lg text-center">
            <p className="text-xs text-muted-foreground font-body">Axis {axis}</p>
            <p className="text-lg font-heading font-bold text-foreground">{val}</p>
            <p className="text-xs text-muted-foreground">m/s²</p>
          </div>
        ))}
      </div>

      {/* Simulate buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setStatus("alert")}
          className="flex-1 p-2 rounded-lg bg-sos/10 text-sos font-body text-sm font-medium hover:bg-sos/20 transition-colors"
        >
          Simulate Fall
        </button>
        <button
          onClick={() => setStatus("monitoring")}
          className="flex-1 p-2 rounded-lg bg-primary/10 text-primary font-body text-sm font-medium hover:bg-primary/20 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default FallDetectionPanel;
