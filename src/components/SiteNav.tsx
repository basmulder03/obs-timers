import { NavLink } from "react-router-dom";
import styles from "@/components/SiteNav.module.scss";

export function SiteNav() {
  return (
    <header className={styles.siteNav}>
      <div className={styles.brand}>
        <strong>OBS Timers</strong>
      </div>
      <nav className={styles.links}>
        <NavLink to="/app" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`.trim()}>
          Builder
        </NavLink>
        <NavLink to="/community" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`.trim()}>
          Community
        </NavLink>
        <NavLink to="/docs" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`.trim()}>
          Docs
        </NavLink>
      </nav>
    </header>
  );
}
