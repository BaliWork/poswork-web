import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar will be implemented in a later phase */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
