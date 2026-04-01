import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2 } from "lucide-react";

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("Hi! I'm your voice assistant. Tap the mic and tell me what you need.");
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setResponse("Sorry, your browser doesn't support voice recognition. Try Chrome!");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const text = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setTranscript(text);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (transcript) {
        processCommand(transcript);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setResponse("I didn't catch that. Please try again.");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setTranscript("");
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const processCommand = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes("medicine") || lower.includes("pill")) {
      setResponse("✅ Great! I've marked your medicine as taken. Keep it up!");
    } else if (lower.includes("help") || lower.includes("emergency")) {
      setResponse("🚨 I'm alerting your emergency contacts right now. Stay calm.");
    } else if (lower.includes("water") || lower.includes("drink")) {
      setResponse("💧 Good job staying hydrated! I'll log that for you.");
    } else if (lower.includes("walk") || lower.includes("exercise")) {
      setResponse("🚶 Your walk has been logged. You're doing amazing today!");
    } else if (lower.includes("how") && lower.includes("doing")) {
      setResponse("😊 You're doing wonderfully! 5 out of 8 tasks done today. Keep going!");
    } else {
      setResponse(`I heard: "${text}". Try saying things like "I took my medicine" or "Log my walk".`);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
        <Volume2 className="w-5 h-5 text-voice" />
        Voice Assistant
      </h2>

      {/* Response bubble */}
      <motion.div
        key={response}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-accent p-4 rounded-2xl rounded-tl-sm"
      >
        <p className="text-base font-body text-accent-foreground">{response}</p>
      </motion.div>

      {/* Transcript */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-secondary p-3 rounded-2xl rounded-tr-sm"
          >
            <p className="text-sm text-muted-foreground">You said:</p>
            <p className="text-base font-body text-foreground">{transcript}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mic button */}
      <div className="flex justify-center">
        <motion.button
          onClick={isListening ? stopListening : startListening}
          whileTap={{ scale: 0.9 }}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
            isListening
              ? "bg-voice animate-sos-pulse"
              : "bg-voice hover:scale-105"
          }`}
        >
          {isListening ? (
            <MicOff className="w-8 h-8 text-voice-foreground" />
          ) : (
            <Mic className="w-8 h-8 text-voice-foreground" />
          )}
        </motion.button>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        {isListening ? "Listening... tap to stop" : "Tap to speak"}
      </p>
    </div>
  );
};

export default VoiceAssistant;
