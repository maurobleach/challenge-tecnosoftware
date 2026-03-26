import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink, useLocation, useNavigate } from "react-router";

import { useAuth } from "~/hooks/useAuth";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar sx={{ gap: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Challenge App
          </Typography>
          <Button
            color="inherit"
            component={RouterLink}
            to="/products"
            variant={pathname === "/products" ? "outlined" : "text"}
          >
            Productos
          </Button>
          <Button color="inherit" onClick={handleLogout}>
            Salir
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 3 }}>{children}</Container>
    </Box>
  );
}
