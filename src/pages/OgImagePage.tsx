import type React from "react";
import { Sparkles } from "lucide-react";

const OgImagePage: React.FC = () => {
  return (
    <div
      className="flex items-center justify-center bg-[#0a0a0f] overflow-hidden"
      style={{ width: 1200, height: 630 }}
    >
      {/* Background decorative glow */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(245,184,0,0.15) 0%, transparent 70%)",
          top: "50%",
          left: "75%",
          transform: "translate(-50%, -50%)",
        }}
      />

      <div className="flex items-center gap-24 relative z-10 px-24">
        {/* Left side - Text */}
        <div className="flex flex-col items-start gap-6 max-w-[560px]">
          <h1
            className="font-extrabold tracking-tight text-[#f0f0f5] leading-none"
            style={{ fontSize: "90px" }}
          >
            Lagom
          </h1>
          <p
            className="font-semibold leading-tight"
            style={{ fontSize: "48px", color: "#f5b800" }}
          >
            Eurovision
          </p>
          <p
            className="font-medium leading-relaxed"
            style={{ fontSize: "28px", color: "#8a8a9a", marginTop: "16px" }}
          >
            Rate Eurovision songs<br />with your friends in real time
          </p>
        </div>

        {/* Right side - Logo */}
        <div className="flex-shrink-0">
          <div
            className="flex items-center justify-center rounded-[32px] bg-[#f5b800] shadow-[0_0_80px_rgba(245,184,0,0.3)]"
            style={{ width: 280, height: 280 }}
          >
            <Sparkles
              className="text-[#0a0a0f]"
              style={{ width: 140, height: 140 }}
              strokeWidth={2.5}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OgImagePage;
