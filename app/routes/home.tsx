import type { Route } from "./+types/home";
import Index from "~/pages/index/index";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumir notícias" },
    { name: "description", content: "Resuma e compartilhe notícias!" },
  ];
}

export default function Home() {
  return <Index />;
}
