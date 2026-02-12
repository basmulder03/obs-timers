import { NavLink } from "react-router-dom";

export function SiteNav() {
  return (
    <header className="site-nav">
      <div>
        <strong>OBS Timers</strong>
      </div>
      <nav className="links">
        <NavLink to="/app" className={({ isActive }) => (isActive ? "active" : "")}>Builder</NavLink>
        <NavLink to="/community" className={({ isActive }) => (isActive ? "active" : "")}>Community</NavLink>
        <NavLink to="/docs" className={({ isActive }) => (isActive ? "active" : "")}>Docs</NavLink>
      </nav>
    </header>
  );
}
