import type { Route } from "./+types/home";
import { Box, CircularProgress } from "@mui/material";
import { Navigate } from "react-router";

import { useAuth } from "~/hooks/useAuth";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Frontend de Inventario" },
    { name: "description", content: "Aplicacion frontend para auth, productos e inventario" },
  ];
}

export default function Home() {
  const { isAuthenticated, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return <Navigate to={isAuthenticated ? "/products" : "/login"} replace />;
}
