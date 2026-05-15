import { useCallback } from "react";
import { useWebHaptics } from "web-haptics/react";

export function useHaptics() {
  const haptic = useWebHaptics();

  const trigger = useCallback(
    (type?: "light" | "medium" | "heavy" | "success" | "warning" | "error" | "selection") => {
      void (async () => {
        try {
          await haptic.trigger(type ?? "medium");
        } catch {
          // Silently fail on unsupported devices
        }
      })();
    },
    [haptic],
  );

  return { trigger };
}
