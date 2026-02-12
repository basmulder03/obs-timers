import { useEffect, useState } from "react";

export type FontLoadStatus = "idle" | "loading" | "loaded" | "error";

export function useDynamicFont(fontFamily: string, fontUrl: string): {
  resolvedFamily: string;
  status: FontLoadStatus;
  message: string;
} {
  const [resolvedFamily, setResolvedFamily] = useState(fontFamily);
  const [status, setStatus] = useState<FontLoadStatus>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setResolvedFamily(fontFamily);
    if (!fontUrl.trim()) {
      setStatus("idle");
      setMessage("");
    }
  }, [fontFamily]);

  useEffect(() => {
    const url = fontUrl.trim();
    if (!url) {
      return;
    }

    setStatus("loading");
    setMessage("");

    const isStylesheet = /\.css(\?|$)/i.test(url);
    if (isStylesheet) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      link.onload = () => {
        setStatus("loaded");
        setMessage("Stylesheet font loaded.");
      };
      link.onerror = () => {
        setStatus("error");
        setMessage("Could not load stylesheet font (check URL or CORS).");
      };
      document.head.append(link);
      return () => {
        link.remove();
      };
    }

    let cancelled = false;
    const family = fontFamily.trim() || "Custom Overlay Font";
    const face = new FontFace(family, `url(${url})`);
    face
      .load()
      .then((loaded) => {
        if (cancelled) {
          return;
        }
        document.fonts.add(loaded);
        setResolvedFamily(family);
        setStatus("loaded");
        setMessage("Font file loaded.");
      })
      .catch(() => {
        setStatus("error");
        setMessage("Could not load font file (check URL or CORS).");
      });

    return () => {
      cancelled = true;
      try {
        document.fonts.delete(face);
      } catch {
        return;
      }
    };
  }, [fontFamily, fontUrl]);

  return { resolvedFamily, status, message };
}
