import type { ProductFormValues } from "~/components/product/ProductForm";

const PRODUCT_DRAFTS_KEY = "product_drafts";

type DraftMap = Record<string, ProductFormValues>;

function getDraftMap(): DraftMap {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = window.localStorage.getItem(PRODUCT_DRAFTS_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as DraftMap;
    return parsed ?? {};
  } catch {
    return {};
  }
}

function setDraftMap(draftMap: DraftMap): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(PRODUCT_DRAFTS_KEY, JSON.stringify(draftMap));
}

export function getProductDraft(productId: number): ProductFormValues | null {
  const draftMap = getDraftMap();
  return draftMap[String(productId)] ?? null;
}

export function setProductDraft(productId: number, values: ProductFormValues): void {
  const draftMap = getDraftMap();
  draftMap[String(productId)] = values;
  setDraftMap(draftMap);
}

export function clearProductDraft(productId: number): void {
  const draftMap = getDraftMap();
  delete draftMap[String(productId)];
  setDraftMap(draftMap);
}
