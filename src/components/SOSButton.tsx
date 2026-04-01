import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, X, AlertTriangle } from "lucide-react";

interface SOSButtonProps {
  onEmergencyStateChange?: (isEmergency: boolean) => void;
}

const SOSButton = ({ onEmergencyStateChange }: SOSButtonProps) => {
  const [isActive, setIsActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const handleSOS = () => {
    if (isActive) {
      setIsActive(false);
      setCountdown(null);
      onEmergencyStateChange?.(false);
      return;
    }
    setIsActive(true);
    onEmergencyStateChange?.(true);
    let count = 5;
    setCountdown(count);
    const interval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(interval);
        setCountdown(null);
        
        // Trigger Telegram Alert
        const telegramToken = "8367204813:AAFhSRWxBC9VYDDGj_2YrbKl_84SFry30vg";
        const chatId = "8507257605";
        const message = "🚨 EMERGENCY! The SOS button was pressed on Guardian Companion!";
        
        // 1. Send telegram message
        fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
          }),
        }).catch(err => console.error("Failed to send Telegram alert:", err));

        // 2. Send email via local Express backend
        fetch(`http://localhost:3001/api/sos-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message,
            location: "Location data unavailable.",
          }),
        }).catch(err => console.error("Failed to send Email alert:", err));

        // Trigger UI alert
        alert("🚨 Emergency contacts have been notified via Telegram and Email!");
        setIsActive(false);
        onEmergencyStateChange?.(false);
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  return (
    <motion.div
      className="relative flex flex-col items-center gap-4"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <span className={`absolute inset-0 rounded-full ${isActive ? "animate-ping bg-red-400/30" : "bg-red-300/10"}`} />
      <button
        onClick={handleSOS}
        className={`relative h-40 w-40 rounded-full flex items-center justify-center transition-all duration-300 border border-white/30 shadow-[inset_8px_8px_18px_rgba(255,255,255,0.12),inset_-10px_-10px_18px_rgba(0,0,0,0.45),0_14px_32px_rgba(255,71,87,0.45)] backdrop-blur-md ${
          isActive
            ? "bg-sos animate-sos-pulse"
            : "bg-gradient-to-br from-red-500 to-red-700 hover:scale-105"
        }`}
      >
        <AnimatePresence mode="wait">
          {isActive ? (
            <motion.div
              key="cancel"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex flex-col items-center gap-1"
            >
              <X className="w-10 h-10 text-sos-foreground" />
              <span className="text-sos-foreground font-heading text-lg font-bold">
                {countdown}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="sos"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex flex-col items-center gap-1"
            >
              <Phone className="w-10 h-10 text-sos-foreground" />
              <span className="text-sos-foreground font-heading text-xl font-extrabold">
                SOS
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
      <p className="text-base font-body text-center max-w-[220px]" style={{ color: "#E0E0E0" }}>
        {isActive ? "Tap again to cancel" : "Press & hold for emergency"}
      </p>
    </motion.div>
  );
};

export default SOSButton;
