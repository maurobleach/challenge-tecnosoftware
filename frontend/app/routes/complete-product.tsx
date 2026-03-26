import { Alert, Box, Button, FormControlLabel, Paper, Stack, Switch, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import type { FormEvent } from "react";

import { useAuth } from "~/hooks/useAuth";
import { productService } from "~/modules/product/product.service";

export default function CompleteProductPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { token } = useAuth();

  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [about, setAbout] = useState("");
  const [isTestDetail, setIsTestDetail] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const parsedProductId = Number(productId);

  useEffect(() => {
    if (!token || !Number.isInteger(parsedProductId)) {
      return;
    }

    const loadProduct = async () => {
      try {
        const product = await productService.getProduct(token, parsedProductId);
        setTitle(product.title ?? "");
      } catch {
        // Keep form available even if preload fails.
      }
    };

    void loadProduct();
  }, [token, parsedProductId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || !Number.isInteger(parsedProductId)) {
      setError("ID de producto invalido");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await productService.addProductDetails(token, parsedProductId, {
        title,
        code,
        variationType: "NONE",
        details: {
          category: "Test",
          test: isTestDetail,
        },
        about: about
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        description,
      });
      navigate("/products");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Error al completar producto");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Paper sx={{ p: 3, width: "100%", maxWidth: 640 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Completar producto (Paso 2)
        </Typography>
        <Stack component="form" spacing={2} onSubmit={handleSubmit}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Titulo"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Codigo"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Descripcion"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Sobre el producto (separado por comas)"
            value={about}
            onChange={(event) => setAbout(event.target.value)}
            required
            fullWidth
          />
          <FormControlLabel
            control={
              <Switch checked={isTestDetail} onChange={(_, checked) => setIsTestDetail(checked)} />
            }
            label="Detalle de prueba"
          />
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar detalles"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
