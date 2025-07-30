import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Footer } from "~/components/ui/Footer";
import { useToast } from "~/context/ToastContext";

export default function Index() {
  const { showToast } = useToast();
  // --- Estados do Componente ---
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [summaryId, setSummaryId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processNewsUrl = async (articleUrl: string) => {
    const backendUrl = `https://api-resumo-815414977002.us-central1.run.app`;

    try {
      const response = await fetch(
        `${backendUrl}?url=${encodeURIComponent(articleUrl)}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: "Falha ao ler a resposta de erro.",
        }));
        throw new Error(
          `Erro: ${response.status} - ${errorData.error || response.statusText}`
        );
      }
      return await response.json();
    } catch (err) {
      console.error("Erro na comunicação com o servidor:", err);
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
        throw new Error("A resposta do servidor estava incompleta.");
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

  const handleCopyLink = () => {
    if (summaryId) {
      const link = `${window.location.origin}/resumo/${summaryId}`;
      navigator.clipboard.writeText(link);
      showToast("success", "Link copiado!");
    }
  };

  return (
    <div className="w-full py-12 p-4  h-full flex flex-col items-center font-sans text-white">
      <header className="text-center mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-cyan-400">
            Resumido
          </h1>
          <h2 className="text-slate-400 md:text-xl font-medium mt-2">
            Seu app de resumo de notícias.
          </h2>
        </div>

        <p className="text-slate-400 mt-2">
          Cole o link de uma notícia e obtenha um resumo instantâneo.
        </p>
      </header>

      <section className="h-full w-full max-w-2xl">
        <form
          onSubmit={handleSummarize}
          className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-grow relative">
            <input
              type="url"
              name="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://portal-de-noticia.com/..."
              className="w-full pr-12 flex-grow bg-slate-800 border border-slate-700 rounded-md px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            />
            {url.length > 0 && (
              <span onClick={() => setUrl("")}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="absolute size-8 right-3 top-2.5 bg-slate-400 hover:bg-slate-700 hover:cursor-pointer rounded-full p-1">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </span>
            )}
          </div>
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

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/resumo/${summaryId}`}
                    className="w-full bg-slate-800 border border-slate-600 rounded-md p-2 mt-2 text-slate-300"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />

                  <button
                    type="button"
                    className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-bold px-4 py-2 rounded-md mt-2 transition-all"
                    onClick={() => handleCopyLink()}
                    title="Copiar link">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      className="size-6">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
