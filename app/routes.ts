import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("resumo/:id", "pages/resumo/resumo.$id.tsx"),
] satisfies RouteConfig;
