import { useEffect, useState, useRef } from "react";
import { MapPin } from "lucide-react";
import { toast } from "sonner";

interface LocationData {
  location: string;
  confidence: number;
  status: string;
  timestamp: number;
}

const LocationTracker = () => {
  const [data, setData] = useState<LocationData>({ location: "Calibrating...", confidence: 0, status: "Scanning", timestamp: 0 });
  const prevLocationRef = useRef<string>("");

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await fetch("http://localhost:5000/status");
        if (res.ok) {
          const json: LocationData = await res.json();
          setData(json);

          // Trigger toast on Room 302
          if (json.location !== prevLocationRef.current) {
            const lowLoc = json.location.toLowerCase();
            const prevLowLoc = prevLocationRef.current.toLowerCase();
            
            if (lowLoc.includes("302") && !prevLowLoc.includes("302")) {
              toast.error("Alert: Resident has entered Room 302!", {
                description: "Security / Room 302 notification triggered.",
                duration: 8000,
              });
            }
            prevLocationRef.current = json.location;
          }
        }
      } catch (err) {
        console.error("Failed to fetch location", err);
      }
    };

    const interval = setInterval(fetchLocation, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-2 text-center">
      <div className="mb-2 rounded-full bg-cyan-400/20 p-4 shadow-[0_0_15px_rgba(34,211,238,0.5)]">
        <MapPin className="h-8 w-8 text-cyan-400" />
      </div>
      <h3 className="mb-1 text-xl font-heading font-bold" style={{ color: "#E0E0E0" }}>Current Location</h3>
      <p className="text-3xl font-black text-white dropshadow-md">{data.location}</p>
      <p className="mt-2 text-sm text-cyan-200">Confidence: <span className="font-mono">{data.confidence.toFixed(1)}%</span></p>
      <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-950/60 px-3 py-1 border border-cyan-200/20">
        <div className={`h-2 w-2 rounded-full ${data.status === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
        <span className="text-xs font-semibold uppercase text-slate-300">{data.status}</span>
      </div>
    </div>
  );
};

export default LocationTracker;
