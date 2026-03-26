import { Alert, Button, Chip, Stack, TextField, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  type CategoryOption,
  getDefaultProductFormValues,
  isProductComplete,
  ProductForm,
  type ProductFormValues,
} from "~/components/product/ProductForm";
import { Modal } from "~/components/ui/Modal";
import { SimpleTable } from "~/components/ui/SimpleTable";
import { useAuth } from "~/hooks/useAuth";
import { categoryService } from "~/modules/category/category.service";
import { inventoryService, type InventoryItem } from "~/modules/inventory/inventory.service";
import { productService, type Product } from "~/modules/product/product.service";
import { clearProductDraft, getProductDraft, setProductDraft } from "~/utils/productDrafts";

type Column = {
  key: string;
  label: string;
  render?: (row: Product) => React.ReactNode;
};

function mapProductToFormValues(product: Product): ProductFormValues {
  return {
    categoryId: String(product.categoryId ?? 1),
    title: product.title ?? "",
    code: product.code ?? "",
    description: product.description ?? "",
    variationType: (product.variationType as ProductFormValues["variationType"]) ?? "NONE",
    about: product.about?.join(", ") ?? "",
    detailsCategory: "Test",
    detailsTest: Boolean(product.details?.test ?? true),
  };
}

function getDetailsPayload(values: ProductFormValues) {
  return {
    title: values.title.trim(),
    code: values.code.trim(),
    variationType: values.variationType,
    details: {
      category: values.detailsCategory,
      test: values.detailsTest,
    },
    about: values.about
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    description: values.description.trim(),
  };
}

export default function ProductListPage() {
  const { token } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productModalLoading, setProductModalLoading] = useState(false);
  const [productModalMode, setProductModalMode] = useState<"create" | "edit" | "view">("create");
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productFormValues, setProductFormValues] = useState<ProductFormValues>(
    getDefaultProductFormValues(),
  );

  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [inventoryProductId, setInventoryProductId] = useState("");
  const [inventoryNewStock, setInventoryNewStock] = useState("");
  const [inventoryData, setInventoryData] = useState<InventoryItem | null>(null);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  const isEditing = editingProductId !== null;
  const isViewMode = productModalMode === "view";
  const isFormComplete = isProductComplete(productFormValues);
  const categoryNameById = useMemo(
    () => Object.fromEntries(categories.map((category) => [category.id, category.name])),
    [categories],
  );
  const editingProduct = useMemo(
    () => products.find((product) => product.id === editingProductId) ?? null,
    [products, editingProductId],
  );
  const isEditingActiveProduct = Boolean(editingProduct?.isActive);

  const loadProducts = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await productService.getProducts(token);
      setProducts(result.sort((a, b) => b.id - a.id));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Error al cargar productos");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const loadCategories = useCallback(async () => {
    try {
      const result = await categoryService.getCategories(token);
      setCategories(result.map((category) => ({ id: category.id, name: category.name })));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Error al cargar categorias");
    }
  }, [token]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const openNewProductModal = () => {
    setProductModalMode("create");
    setEditingProductId(null);
    const nextValues = getDefaultProductFormValues();
    if (categories.length > 0) {
      nextValues.categoryId = String(categories[0].id);
    }
    setProductFormValues(nextValues);
    setProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    setProductModalMode("edit");
    const backendValues = mapProductToFormValues(product);
    const localDraft = getProductDraft(product.id);
    setEditingProductId(product.id);
    setProductFormValues(localDraft ?? backendValues);
    setProductModalOpen(true);
  };

  const openViewProductModal = (product: Product) => {
    setProductModalMode("view");
    setEditingProductId(product.id);
    setProductFormValues(mapProductToFormValues(product));
    setProductModalOpen(true);
  };

  const handleSaveDraft = async () => {
    if (!token) {
      return;
    }

    const categoryId = Number(productFormValues.categoryId);
    if (!Number.isInteger(categoryId)) {
      setError("ID de categoria invalido");
      return;
    }

    setProductModalLoading(true);
    setError(null);

    try {
      let productId = editingProductId;
      if (!productId) {
        const created = await productService.createProduct(token, { categoryId });
        productId = created.id;
      }

      if (isFormComplete) {
        await productService.addProductDetails(token, productId, getDetailsPayload(productFormValues));
        clearProductDraft(productId);
      } else {
        setProductDraft(productId, productFormValues);
      }

      setProductModalOpen(false);
      await loadProducts();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Error al guardar draft");
    } finally {
      setProductModalLoading(false);
    }
  };

  const handleSaveComplete = async () => {
    if (!token || !isFormComplete) {
      return;
    }

    const categoryId = Number(productFormValues.categoryId);
    if (!Number.isInteger(categoryId)) {
      setError("ID de categoria invalido");
      return;
    }

    setProductModalLoading(true);
    setError(null);

    try {
      let productId = editingProductId;
      if (!productId) {
        const created = await productService.createProduct(token, { categoryId });
        productId = created.id;
      }

      await productService.addProductDetails(token, productId, getDetailsPayload(productFormValues));
      clearProductDraft(productId);
      setProductModalOpen(false);
      await loadProducts();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Error al guardar");
    } finally {
      setProductModalLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!token || !isFormComplete || !editingProductId) {
      return;
    }

    setProductModalLoading(true);
    setError(null);

    try {
      await productService.addProductDetails(token, editingProductId, getDetailsPayload(productFormValues));
      clearProductDraft(editingProductId);
      setProductModalOpen(false);
      await loadProducts();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Error al guardar cambios");
    } finally {
      setProductModalLoading(false);
    }
  };

  const loadInventoryByProductId = async (productId: number) => {
    if (!token) {
      return;
    }

    setInventoryLoading(true);
    setError(null);

    try {
      const result = await inventoryService.getInventoryByProduct(token, productId);
      setInventoryData(result);
      setInventoryNewStock(String(result.availableStock));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Error al cargar inventario");
    } finally {
      setInventoryLoading(false);
    }
  };

  const openInventoryModal = (productId?: number) => {
    setInventoryOpen(true);
    if (productId) {
      setInventoryProductId(String(productId));
      void loadInventoryByProductId(productId);
    }
  };

  const handleUpdateInventory = async () => {
    if (!token) {
      return;
    }

    const parsedProductId = Number(inventoryProductId);
    const parsedQuantity = Number(inventoryNewStock);
    if (!Number.isInteger(parsedProductId) || !Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      setError("Ingresa valores validos para inventario");
      return;
    }

    setInventoryLoading(true);
    setError(null);

    try {
      const result = await inventoryService.updateStock(token, parsedProductId, parsedQuantity);
      setInventoryData(result);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Error al actualizar inventario");
    } finally {
      setInventoryLoading(false);
    }
  };

  const columns: Column[] = useMemo(
    () => [
      { key: "id", label: "ID", render: (product) => product.id },
      {
        key: "title",
        label: "Titulo",
        render: (product) => product.title || <Chip size="small" label="Sin detalles" />,
      },
      {
        key: "estado",
        label: "Estado",
        render: (product) =>
          product.isActive ? (
            <Chip size="small" color="success" label="Activo" />
          ) : (
            <Chip size="small" color="warning" label="Borrador" />
          ),
      },
      {
        key: "categoria",
        label: "Categoria",
        render: (product) =>
          product.category?.name || (product.categoryId ? categoryNameById[product.categoryId] : undefined) || "-",
      },
      {
        key: "acciones",
        label: "Acciones",
        render: (product) => (
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" onClick={() => openEditProductModal(product)}>
              Editar
            </Button>
            <Button size="small" variant="outlined" onClick={() => openViewProductModal(product)}>
              Ver
            </Button>
            <Button size="small" variant="text" onClick={() => openInventoryModal(product.id)}>
              Inventario
            </Button>
          </Stack>
        ),
      },
    ],
    [categoryNameById],
  );

  return (
    <Stack spacing={2}>
      <Typography variant="h5" style={{color: "white"}}>Productos</Typography>
      {error && <Alert severity="error">{error}</Alert>}

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <Button variant="contained" onClick={openNewProductModal}>
          Nuevo Producto
        </Button>
      </Stack>

      <SimpleTable rows={products} rowKey={(product) => String(product.id)} columns={columns} />

      <Modal
        open={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        title={
          productModalMode === "view"
            ? "Ver Producto"
            : isEditing
              ? "Editar Producto"
              : "Nuevo Producto"
        }
        fullWidth
        maxWidth="sm"
        content={
          <ProductForm
            values={productFormValues}
            onChange={setProductFormValues}
            categories={categories}
            disableCategoryId={isEditing}
            readOnly={isViewMode}
          />
        }
        actions={
          <>
            <Button onClick={() => setProductModalOpen(false)}>Cancelar</Button>
            {!isViewMode && !isEditingActiveProduct && (
              <Button variant="outlined" onClick={() => void handleSaveDraft()} disabled={productModalLoading}>
                {productModalLoading ? "Guardando..." : "Borrador"}
              </Button>
            )}
            {!isViewMode && (
              <Button
                variant="contained"
                onClick={() =>
                  void (isEditingActiveProduct ? handleSaveChanges() : handleSaveComplete())
                }
                disabled={productModalLoading || !isFormComplete}
              >
                {isEditingActiveProduct ? "Guardar cambios" : "Guardar"}
              </Button>
            )}
          </>
        }
      />

      <Modal
        open={inventoryOpen}
        onClose={() => setInventoryOpen(false)}
        title="Inventario"
        fullWidth
        maxWidth="sm"
        content={
          <Stack spacing={2} sx={{ mt: 1 }}>
            <ProductFormInventoryFields
              inventoryProductId={inventoryProductId}
              inventoryProductTitle={
                products.find((product) => String(product.id) === inventoryProductId)?.title ?? undefined
              }
              inventoryNewStock={inventoryNewStock}
              setInventoryNewStock={setInventoryNewStock}
              inventoryLoading={inventoryLoading}
              onUpdateInventory={handleUpdateInventory}
              inventoryData={inventoryData}
            />
          </Stack>
        }
        actions={<Button onClick={() => setInventoryOpen(false)}>Cerrar</Button>}
      />
    </Stack>
  );
}

type ProductFormInventoryFieldsProps = {
  inventoryProductId: string;
  inventoryProductTitle?: string;
  inventoryNewStock: string;
  setInventoryNewStock: (value: string) => void;
  inventoryLoading: boolean;
  onUpdateInventory: () => Promise<void>;
  inventoryData: InventoryItem | null;
};

function ProductFormInventoryFields({
  inventoryProductId,
  inventoryProductTitle,
  inventoryNewStock,
  setInventoryNewStock,
  inventoryLoading,
  onUpdateInventory,
  inventoryData,
}: ProductFormInventoryFieldsProps) {
  return (
    <>
      <Typography variant="body2">
        {inventoryProductTitle ? `Producto: ${inventoryProductTitle}` : `Producto ID: ${inventoryProductId}`}
      </Typography>
      <Typography variant="body1">
        Stock disponible: {inventoryData ? inventoryData.availableStock : "-"}
      </Typography>
      <TextField
        value={inventoryNewStock}
        onChange={(event) => setInventoryNewStock(event.target.value)}
        label="Nuevo stock disponible"
        type="number"
        fullWidth
      />
      <Button variant="contained" onClick={() => void onUpdateInventory()} disabled={inventoryLoading}>
        Guardar stock
      </Button>
    </>
  );
}
