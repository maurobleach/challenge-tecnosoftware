import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { FormEvent } from "react";

import { useAuth } from "~/hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { token, isAuthReady, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthReady && token) {
      navigate("/products");
    }
  }, [isAuthReady, navigate, token]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login({ email, password });
      navigate("/products");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Error al iniciar sesion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
      <Paper sx={{ p: 3, width: "100%", maxWidth: 420 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Inicio de sesion
        </Typography>
        <Stack component="form" spacing={2} onSubmit={handleSubmit}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Contrasena"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            fullWidth
          />
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? "Ingresando..." : "Ingresar"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
