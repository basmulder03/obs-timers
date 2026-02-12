import styles from "@/renderers/Renderers.module.scss";

export function ClassicRenderer({ text }: { text: string }) {
  return <span className={styles.rendererClassic}>{text}</span>;
}
