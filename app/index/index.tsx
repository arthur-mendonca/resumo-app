import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Index() {
  // --- Estados do Componente ---
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [summaryId, setSummaryId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processNewsUrl = async (articleUrl: string) => {
    // ATENÇÃO: Verifique se esta é a URL correta da sua função 'processAndSaveNews'
    const backendUrl = `https://api-resumo-815414977002.us-central1.run.app`;

    try {
      const response = await fetch(
        `${backendUrl}?url=${encodeURIComponent(articleUrl)}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: "Falha ao ler a resposta de erro do back-end.",
        }));
        throw new Error(
          `Erro no back-end: ${response.status} - ${errorData.error || response.statusText}`
        );
      }
      return await response.json();
    } catch (err) {
      console.error("Erro na comunicação com o back-end:", err);
      throw err;
    }
  };

  const handleSummarize = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!url) {
      setError("Por favor, insira uma URL.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSummary("");
    setSummaryId("");
    setOriginalUrl("");

    try {
      const result = await processNewsUrl(url);
      if (result && result.summary && result.id) {
        setSummary(result.summary);
        setSummaryId(result.id);
        setOriginalUrl(url); // Guarda a URL original para exibir
      } else {
        throw new Error("A resposta do back-end estava incompleta.");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro desconhecido.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen flex flex-col items-center font-sans p-4 text-white">
      <div className="w-full max-w-2xl py-12">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-cyan-400">
            Resumidor de Notícias
          </h1>
          <p className="text-slate-400 mt-2">
            Cole o link de uma notícia e obtenha um resumo instantâneo.
          </p>
        </header>

        <main>
          <form
            onSubmit={handleSummarize}
            className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="url"
              name="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://portal-de-noticia.com/..."
              className="flex-grow bg-slate-800 border border-slate-700 rounded-md px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-bold py-3 px-6 rounded-md transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center">
              {isLoading ? (
                <>
                  <svg className="mr-3 size-5 animate-spin" viewBox="0 0 24 24">
                    <span className="sr-only">Loading...</span>
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      strokeWidth="4"
                      stroke="currentColor"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Resumindo...
                </>
              ) : (
                "Resumir"
              )}
            </button>
          </form>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6">
              <strong>Erro: </strong>
              <span>{error}</span>
            </div>
          )}

          {summary && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-cyan-400 mb-3">
                Resumo Gerado
              </h2>
              <div className="prose prose-invert text-slate-300">
                <ReactMarkdown>{summary}</ReactMarkdown>
              </div>
              <div className="border-t pt-4 mt-6 border-slate-700">
                <p className="font-semibold text-slate-400">Link Original:</p>
                <a
                  href={originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline break-all">
                  {originalUrl}
                </a>
              </div>
              {summaryId && (
                <div className="border-t pt-4 mt-4 border-slate-700">
                  <p className="font-semibold text-slate-400">
                    Link para Compartilhar:
                  </p>
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/resumo/${summaryId}`}
                    className="w-full bg-slate-800 border border-slate-600 rounded-md p-2 mt-2 text-slate-300"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
