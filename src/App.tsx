import { Navigate, Route, Routes } from "react-router-dom";
import { SiteNav } from "@/components/SiteNav";
import { BuilderPage } from "@/pages/BuilderPage";
import { CommunityPage } from "@/pages/CommunityPage";
import { DocsPage } from "@/pages/DocsPage";
import { OverlayPage } from "@/pages/OverlayPage";
import { ControlPage } from "@/pages/ControlPage";

export function App() {
  return (
    <Routes>
      <Route
        path="/app"
        element={
          <>
            <SiteNav />
            <BuilderPage />
          </>
        }
      />
      <Route
        path="/community"
        element={
          <>
            <SiteNav />
            <CommunityPage />
          </>
        }
      />
      <Route
        path="/docs"
        element={
          <>
            <SiteNav />
            <DocsPage />
          </>
        }
      />
      <Route
        path="/docs/:slug"
        element={
          <>
            <SiteNav />
            <DocsPage />
          </>
        }
      />
      <Route path="/overlay/:timerType" element={<OverlayPage />} />
      <Route path="/control" element={<ControlPage />} />
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}
