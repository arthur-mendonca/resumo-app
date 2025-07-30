import { useLoaderData, Link } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import ReactMarkdown from "react-markdown";

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Response("ID não encontrado", { status: 404 });
  }

  const backendUrl = `https://get-summary-815414977002.us-central1.run.app`;
  const response = await fetch(`${backendUrl}?id=${id}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Response(errorData.error || "Falha ao buscar o resumo.", {
      status: response.status,
    });
  }

  const data = await response.json();
  return data;
}

export default function SummaryRoute() {
  const summaryData = useLoaderData<typeof loader>();

  return (
    <div className="bg-slate-900 min-h-screen flex flex-col items-center justify-center font-sans p-4 text-white">
      <div className="w-full max-w-2xl">
        {summaryData ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h1 className="text-3xl font-bold text-cyan-400 mb-4">
              Resumo da Notícia
            </h1>
            <div className="prose prose-invert text-slate-300 mb-6">
              <ReactMarkdown>{summaryData.summary}</ReactMarkdown>
            </div>
            <div className="border-t pt-4 border-slate-700">
              <p className="font-semibold text-slate-400">Link Original:</p>
              <a
                href={summaryData.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline break-all">
                {summaryData.originalUrl}
              </a>
            </div>
            <div className="text-center mt-8">
              <Link
                to="/"
                className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-bold py-2 px-4 rounded-md transition-all">
                Resumir outra notícia
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-red-400">Não foi possível carregar o resumo.</p>
        )}
      </div>
    </div>
  );
}
