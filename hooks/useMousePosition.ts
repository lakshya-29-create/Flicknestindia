"use client";

import { useState, useEffect, useCallback, RefObject } from "react";

export interface MousePosition {
  x: number;
  y: number;
}

export function useMousePosition(
  ref?: RefObject<HTMLElement | null>
): MousePosition {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (ref?.current) {
        const rect = ref.current.getBoundingClientRect();
        setPosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      } else {
        setPosition({ x: e.clientX, y: e.clientY });
      }
    },
    [ref]
  );

  useEffect(() => {
    const target = ref?.current || window;
    target.addEventListener("mousemove", handleMouseMove as EventListener);
    return () => target.removeEventListener("mousemove", handleMouseMove as EventListener);
  }, [ref, handleMouseMove]);

  return position;
}
