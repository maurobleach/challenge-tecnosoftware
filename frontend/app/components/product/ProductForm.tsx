import { FormControlLabel, MenuItem, Stack, Switch, TextField } from "@mui/material";

export type VariationType = "NONE" | "OnlySize" | "OnlyColor" | "SizeAndColor";

export type ProductFormValues = {
  categoryId: string;
  title: string;
  code: string;
  description: string;
  variationType: VariationType;
  about: string;
  detailsCategory: "Test";
  detailsTest: boolean;
};

export type CategoryOption = {
  id: number;
  name: string;
};

type ProductFormProps = {
  values: ProductFormValues;
  onChange: (nextValues: ProductFormValues) => void;
  categories: CategoryOption[];
  disableCategoryId?: boolean;
  readOnly?: boolean;
};

export function getDefaultProductFormValues(): ProductFormValues {
  return {
    categoryId: "1",
    title: "",
    code: "",
    description: "",
    variationType: "NONE",
    about: "",
    detailsCategory: "Test",
    detailsTest: true,
  };
}

export function isProductComplete(values: ProductFormValues): boolean {
  return Boolean(
    values.categoryId &&
      values.title.trim() &&
      values.code.trim() &&
      values.description.trim() &&
      values.variationType &&
      values.detailsCategory &&
      values.about
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean).length > 0,
  );
}

export function ProductForm({
  values,
  onChange,
  categories,
  disableCategoryId = false,
  readOnly = false,
}: ProductFormProps) {
  const update = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => {
    onChange({
      ...values,
      [key]: value,
    });
  };

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <TextField
        select
        label="Categoria"
        value={values.categoryId}
        onChange={(event) => update("categoryId", event.target.value)}
        disabled={readOnly || disableCategoryId || categories.length === 0}
        fullWidth
      >
        {categories.length === 0 && <MenuItem value="">Sin categorias</MenuItem>}
        {categories.map((category) => (
          <MenuItem key={category.id} value={String(category.id)}>
            {category.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Titulo"
        value={values.title}
        onChange={(event) => update("title", event.target.value)}
        disabled={readOnly}
        fullWidth
      />
      <TextField
        label="Codigo"
        value={values.code}
        onChange={(event) => update("code", event.target.value)}
        disabled={readOnly}
        fullWidth
      />
      <TextField
        label="Descripcion"
        value={values.description}
        onChange={(event) => update("description", event.target.value)}
        disabled={readOnly}
        fullWidth
      />
      <TextField
        select
        label="Tipo de variacion"
        value={values.variationType}
        onChange={(event) => update("variationType", event.target.value as VariationType)}
        disabled={readOnly}
        fullWidth
      >
        <MenuItem value="NONE">NONE</MenuItem>
        <MenuItem value="OnlySize">OnlySize</MenuItem>
        <MenuItem value="OnlyColor">OnlyColor</MenuItem>
        <MenuItem value="SizeAndColor">SizeAndColor</MenuItem>
      </TextField>
      <TextField
        label="About (separado por comas)"
        value={values.about}
        onChange={(event) => update("about", event.target.value)}
        disabled={readOnly}
        fullWidth
      />
      <TextField
        select
        label="Categoria de details"
        value={values.detailsCategory}
        onChange={(event) => update("detailsCategory", event.target.value as "Test")}
        disabled={readOnly}
        fullWidth
      >
        <MenuItem value="Test">Test</MenuItem>
      </TextField>
      <FormControlLabel
        control={
          <Switch
            checked={values.detailsTest}
            onChange={(_, checked) => update("detailsTest", checked)}
            disabled={readOnly}
          />
        }
        label="Detalle de prueba"
      />
    </Stack>
  );
}
