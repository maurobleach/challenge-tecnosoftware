import { index, layout, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  layout("routes/protected-layout.tsx", [
    route("products", "routes/product-list.tsx"),
    route("products/new", "routes/create-product.tsx"),
    route("products/:productId/complete", "routes/complete-product.tsx"),
    route("inventory", "routes/inventory.tsx"),
  ]),
] satisfies RouteConfig;
