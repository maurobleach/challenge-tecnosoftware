import { Outlet } from "react-router";

import { AppLayout } from "~/components/AppLayout";
import { ProtectedRoute } from "~/components/ProtectedRoute";

export default function ProtectedLayoutRoute() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </ProtectedRoute>
  );
}
