import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { publishCommand } from "@/core/storage";
import styles from "@/pages/ControlPage.module.scss";

export function ControlPage() {
  const [search] = useSearchParams();

  const message = useMemo(() => {
    const cmd = search.get("cmd");
    const target = search.get("target") || "default";
    const syncToken = search.get("syncToken") || String(Date.now());
    if (!cmd || !["start", "pause", "reset", "toggle"].includes(cmd)) {
      return "Invalid command.";
    }
    publishCommand(target, cmd as "start" | "pause" | "reset" | "toggle", syncToken);
    return `Command sent: ${cmd} -> ${target}`;
  }, [search]);

  return (
    <main className={styles.root}>
      <section className={styles.panel}>
        <h1>Control Bridge</h1>
        <p>{message}</p>
      </section>
    </main>
  );
}
