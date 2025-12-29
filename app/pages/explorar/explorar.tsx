import { useLoaderData, Link, useSearchParams } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import type { Summary } from "~/types/summaries";
import { parseDate } from "~/utils/parseDate";

// Lista de categorias para criar os botões de filtro.

const categories = [
  { nome: "Política", subcategorias: ["Nacional", "Internacional"] },
  {
    nome: "Economia",
    subcategorias: [
      "Mercado financeiro",
      "Negócios e empresas",
      "Emprego e renda",
    ],
  },
  {
    nome: "Esportes",
    subcategorias: ["Futebol", "Olimpíadas", "Outros esportes"],
  },
  {
    nome: "Tecnologia",
    subcategorias: [
      "Inovação",
      "Startups",
      "Inteligência Artificial",
      "Ciência de dados",
    ],
  },
  {
    nome: "Ciência",
    subcategorias: ["Saúde", "Meio ambiente", "Descobertas científicas"],
  },
  { nome: "Saúde", subcategorias: ["Medicina", "Bem-estar", "Pandemias"] },
  {
    nome: "Cultura e Entretenimento",
    subcategorias: ["Cinema e TV", "Música", "Livros", "Celebridades"],
  },
  {
    nome: "Moda e Estilo de Vida",
    subcategorias: ["Beleza", "Tendências", "Comportamento"],
  },
  {
    nome: "Internacional",
    subcategorias: ["Conflitos", "Geopolítica", "Cooperação internacional"],
  },
  { nome: "Educação", subcategorias: ["Universidades", "Políticas públicas"] },
  { nome: "Segurança", subcategorias: ["Crimes", "Justiça"] },
  { nome: "Opinião", subcategorias: ["Colunistas", "Editorial"] },
  { nome: "Games", subcategorias: ["Lançamentos", "Análises", "eSports"] },
  { nome: "Turismo", subcategorias: ["Viagens", "Destinos", "Dicas"] },
  {
    nome: "Carros e Mobilidade",
    subcategorias: [
      "Lançamentos",
      "Transporte urbano",
      "Tecnologia automotiva",
    ],
  },
  {
    nome: "Imóveis e Construção",
    subcategorias: ["Mercado imobiliário", "Arquitetura", "Urbanismo"],
  },
  {
    nome: "Agronegócio",
    subcategorias: ["Produção", "Exportações", "Tecnologia no campo"],
  },
  {
    nome: "Pets",
    subcategorias: ["Cuidados", "Comportamento animal", "Notícias curiosas"],
  },
  {
    nome: "Religião",
    subcategorias: ["Eventos religiosos", "Sociedade", "Polêmica"],
  },
];

// A função `loader` busca os dados ANTES da página carregar.
export async function loader({ request }: LoaderFunctionArgs) {
  // Pega os parâmetros da URL, como ?category=Esportes
  const url = new URL(request.url);
  const category = url.searchParams.get("category");

  // ATENÇÃO: Verifique se esta é a URL correta da sua função 'getSummaries'
  let backendUrl = ``;

  if (category) {
    // Se houver um filtro de categoria, adiciona à URL da API
    backendUrl += `?category=${encodeURIComponent(category)}`;
  }

  const response = await fetch(backendUrl);

  if (!response.ok) {
    throw new Response("Não foi possível carregar os resumos.", {
      status: 500,
    });
  }

  const summaries = await response.json();
  // Retorna os resumos e a categoria atualmente selecionada para o componente
  return { summaries, currentCategory: category };
}

export default function ExplorePage() {
  const { summaries, currentCategory } = useLoaderData<typeof loader>();
  // const [searchParams] = useSearchParams();

  const orderedSummaries = summaries.sort((a: Summary, b: Summary) => {
    return parseDate(b.createdAt).getTime() - parseDate(a.createdAt).getTime();
  });

  return (
    <div className="min-h-screen font-sans p-4 text-white">
      <div className="w-full max-w-4xl mx-auto py-12">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-cyan-400">
            Explorar Resumos
          </h1>
          <p className="text-slate-400 mt-2">
            Navegue por todas as notícias já resumidas.
          </p>
          <div className="mt-6">
            <Link to="/" className="text-cyan-400 hover:underline">
              ← Voltar para a página inicial
            </Link>
          </div>
        </header>

        {/* Filtros de Categoria */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          <Link
            to="/explorar"
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
              !currentCategory
                ? "bg-cyan-500 text-slate-900"
                : "bg-slate-700 hover:bg-slate-600"
            }`}>
            Todos
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.nome}
              to={`/explorar?category=${encodeURIComponent(cat.nome)}`}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                currentCategory === cat.nome
                  ? "bg-cyan-500 text-slate-900"
                  : "bg-slate-700 hover:bg-slate-600"
              }`}>
              {cat.nome}
            </Link>
          ))}
        </div>

        {/* Lista de Resumos */}
        <main>
          {orderedSummaries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orderedSummaries.map((summary: Summary) => (
                <Link
                  to={`/resumo/${summary.id}`}
                  key={summary.id}
                  className="flex flex-col gap-2 bg-slate-800/50 border border-slate-700 rounded-lg p-5 hover:border-cyan-500 transition-colors">
                  <span className="w-min inline-block bg-slate-700 text-cyan-400 text-xs font-semibold px-2 py-1 rounded-full mb-3">
                    {summary.category}
                  </span>

                  <h2 className="text-lg font-bold text-slate-200 mb-2 line-clamp-3">
                    {summary.summary.split("\n")[0].replace(/\*/g, "")}
                  </h2>
                  <p className="text-sm text-slate-400 line-clamp-4">
                    {summary.summary
                      .substring(summary.summary.indexOf("\n"))
                      .replace(/\*/g, "")}
                  </p>

                  <div className="mt-auto inline-flex items-center text-slate-500 text-xs mt-3">
                    {(() => {
                      const date = parseDate(summary.createdAt);
                      return date.toLocaleDateString();
                    })()}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-500 py-10">
              <p>Nenhum resumo encontrado para esta categoria.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
