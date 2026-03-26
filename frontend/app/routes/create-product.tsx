import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router";
import type { FormEvent } from "react";

import { useAuth } from "~/hooks/useAuth";
import { productService } from "~/modules/product/product.service";

export default function CreateProductPage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [categoryId, setCategoryId] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      setError("No hay token autenticado");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const created = await productService.createProduct(token, {
        categoryId: Number(categoryId),
      });
      navigate(`/products/${created.id}/complete`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Error al crear producto");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Paper sx={{ p: 3, width: "100%", maxWidth: 520 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Crear producto (Paso 1)
        </Typography>
        <Stack component="form" spacing={2} onSubmit={handleSubmit}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="ID de categoria"
            type="number"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            required
            fullWidth
          />
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? "Creando..." : "Crear y continuar"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
