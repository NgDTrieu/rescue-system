import React from "react";
import "./home.css";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-root">
      <div className="app-shell">
        <div className="app-screen">{children}</div>
      </div>
    </div>
  );
}
