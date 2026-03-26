import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

import { useAuth } from "~/hooks/useAuth";
import { inventoryService, type InventoryItem } from "~/modules/inventory/inventory.service";

export default function InventoryPage() {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialProductId = searchParams.get("productId") ?? "";

  const [productId, setProductId] = useState(initialProductId);
  const [quantity, setQuantity] = useState("");
  const [inventory, setInventory] = useState<InventoryItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const parsedProductId = Number(productId);

  const handleLoadInventory = async () => {
    if (!token || !Number.isInteger(parsedProductId)) {
      setError("Ingresa un ID de producto valido");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setSearchParams({ productId: String(parsedProductId) });
      const result = await inventoryService.getInventoryByProduct(token, parsedProductId);
      setInventory(result);
      setQuantity(String(result.availableStock));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Error al cargar inventario");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateInventory = async () => {
    if (!token || !Number.isInteger(parsedProductId)) {
      setError("Ingresa un ID de producto valido");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await inventoryService.updateStock(token, parsedProductId, Number(quantity));
      setInventory(result);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Error al actualizar inventario");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialProductId) {
      void handleLoadInventory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Paper sx={{ p: 3, width: "100%", maxWidth: 520 }}>
        <Stack spacing={2}>
          <Typography variant="h5">Inventario</Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="ID de producto"
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
            fullWidth
          />
          <Button variant="outlined" onClick={() => void handleLoadInventory()} disabled={isLoading}>
            Cargar stock
          </Button>
          <TextField
            label="Cantidad"
            type="number"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            fullWidth
          />
          <Button variant="contained" onClick={() => void handleUpdateInventory()} disabled={isLoading}>
            Actualizar stock
          </Button>
          {inventory && (
            <Typography variant="body2">
              Actual: productId={inventory.productId}, disponible={inventory.availableStock},
              reservado={inventory.reservedStock}
            </Typography>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
