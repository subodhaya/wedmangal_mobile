import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Platform } from "react-native";

/**
 * Combines class names using clsx and tailwind-merge.
 * This ensures Tailwind classes are properly merged without conflicts.
 *
 * Usage:
 * ```tsx
 * cn("px-4 py-2", isActive && "bg-primary", className)
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Returns platform-correct shadow styles (boxShadow on web, shadow* on native)
export function shadow(color: string, opacity: number, radius: number, offsetY = 2): object {
  if (Platform.OS === 'web') {
    let r = 0, g = 0, b = 0;
    const hex = color.replace('#', '');
    if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    }
    return { boxShadow: `0 ${offsetY}px ${radius}px rgba(${r},${g},${b},${opacity})` };
  }
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
  };
}
