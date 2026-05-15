import type React from "react";
import { useState } from "react";
import { useMutation, useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useHaptics } from "@/lib/haptics";
import { Sparkles } from "lucide-react";

const generateTemporaryUserId = () => {
  return `tempUser_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
};

const LandingPage: React.FC = () => {
  const [roomName, setRoomName] = useState("");
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const client = useConvex();
  const joinOrCreateRoomMutation = useMutation(api.rooms.joinOrCreateRoom);
  const { trigger } = useHaptics();

  const handleJoinOrCreateRoom = async () => {
    if (!roomName.trim() || !nickname.trim()) {
      trigger("error");
      alert("Please enter both Room Name and Nickname.");
      return;
    }

    trigger("medium");
    setIsLoading(true);

    try {
      let resolvedUserId: string;

      const existingUserData = await client.query(
        api.rooms.findUserInRoomByNickname,
        { roomName, nickname },
      );

      if (existingUserData) {
        resolvedUserId = existingUserData.userId;
      } else {
        resolvedUserId = generateTemporaryUserId();
      }

      const result = await joinOrCreateRoomMutation({
        roomName,
        nickname,
        userId: resolvedUserId,
      });

      localStorage.setItem("eurovisionUserId", resolvedUserId);
      localStorage.setItem("eurovisionNickname", nickname);
      if (result.roomId) {
        localStorage.setItem("eurovisionRoomId", result.roomId.toString());
        trigger("success");
        void navigate(`/room/${roomName}/contestants`);
      }
    } catch (error) {
      trigger("error");
      console.error("Failed to join or create room:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to join or create room.";
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12 bg-[#0a0a0f]">
      {/* Decorative top glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#f5b800]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10 animate-enter">
        {/* Logo area */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#f5b800] shadow-[0_0_40px_rgba(245,184,0,0.25)] mb-6">
            <Sparkles className="size-8 text-[#0a0a0f]" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#f0f0f5] mb-2">
            Lagom
          </h1>
          <p className="text-[#8a8a9a] text-sm font-medium">
            Rate Eurovision with friends
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <div className="space-y-2 animate-enter animate-enter-delay-1">
            <Label htmlFor="roomName">Room Name</Label>
            <Input
              type="text"
              id="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="e.g. Stockholm 2026"
              autoComplete="off"
              autoCapitalize="words"
            />
          </div>

          <div className="space-y-2 animate-enter animate-enter-delay-2">
            <Label htmlFor="nickname">Your Nickname</Label>
            <Input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Kalle"
              autoComplete="off"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void handleJoinOrCreateRoom();
                }
              }}
            />
          </div>

          <div className="pt-2 animate-enter animate-enter-delay-3">
            <Button
              onClick={() => {
                void handleJoinOrCreateRoom();
              }}
              disabled={isLoading}
              className="w-full h-12 text-base font-bold tracking-wide"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block size-4 border-2 border-[#0a0a0f]/30 border-t-[#0a0a0f] rounded-full animate-spin" />
                  Joining...
                </span>
              ) : (
                "Join Room"
              )}
            </Button>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[#8a8a9a]/60 text-xs mt-8 font-medium">
          Create a new room just by typing a unique name
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
