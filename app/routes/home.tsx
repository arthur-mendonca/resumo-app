import type { Route } from "./+types/home";
import Index from "~/pages/index/index";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumir notícias" },
    { name: "description", content: "Bem-vindo ao Resumir Notícias!" },
  ];
}

export default function Home() {
  return <Index />;
}
