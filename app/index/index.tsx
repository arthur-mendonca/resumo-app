import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router";

// Componente principal da aplicação
export default function Index() {
  // --- Estados do Componente ---
  const [url, setUrl] = useState(""); // Armazena a URL inserida pelo usuário
  const [summary, setSummary] = useState(""); // Armazena o resumo gerado
  const [isLoading, setIsLoading] = useState(false); // Controla o estado de carregamento
  const [error, setError] = useState<string | null>(null); // Armazena mensagens de erro

  /**
   * Função principal que orquestra o processo de resumo.
   * @param {React.FormEvent<HTMLFormElement>} e - O evento do formulário.
   */
  const handleSummarize = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Previne o recarregamento da página ao submeter o formulário
    if (!url) {
      setError("Por favor, insira uma URL.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSummary("");

    try {
      // --- ETAPA 1: Buscar o conteúdo do artigo via back-end ---
      const articleText = await fetchArticleContent(url);

      if (!articleText) {
        throw new Error(
          "Não foi possível extrair o conteúdo do artigo. O texto retornado estava vazio."
        );
      }

      // --- ETAPA 2: Enviar o texto para a API do Gemini para resumir ---
      const generatedSummary = await summarizeWithGemini(articleText);
      setSummary(generatedSummary);
    } catch (err) {
      // Captura e exibe qualquer erro que ocorra durante o processo
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro desconhecido.");
      }
      console.error(err);
    } finally {
      // Garante que o estado de carregamento seja desativado ao final
      setIsLoading(false);
    }
  };

  /**
   * Busca o conteúdo da URL fazendo uma chamada para a sua Cloud Function.
   * @param {string} articleUrl - A URL da notícia.
   * @returns {Promise<string>} O texto extraído do artigo.
   */
  const fetchArticleContent = async (articleUrl: string): Promise<string> => {
    // CORREÇÃO: Usando a URL da Cloud Function que você confirmou funcionar no Postman.
    try {
      const backendUrl = `https://api-resumo-815414977002.us-central1.run.app`;

      const response = await fetch(
        `${backendUrl}?url=${encodeURIComponent(articleUrl)}`
      );

      if (!response.ok) {
        // Tenta ler o corpo do erro para dar uma mensagem mais específica.
        const errorData = await response.json().catch(() => ({
          error: "Falha ao ler a resposta de erro do back-end.",
          msg: response.statusText,
        }));
        console.log("Erro ao buscar conteúdo:", errorData);
        throw new Error(
          `Falha ao buscar conteúdo: ${response.status} - ${errorData.error || response.statusText}`
        );
      }

      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error("Erro ao buscar conteúdo do artigo:", error);
      throw new Error("Erro ao buscar conteúdo do artigo.");
    }
  };

  /**
   * Envia o texto do artigo para a API do Gemini e retorna o resumo.
   * @param {string} textToSummarize - O texto a ser resumido.
   * @returns {Promise<string>} O resumo gerado.
   */
  const summarizeWithGemini = async (
    textToSummarize: string
  ): Promise<string> => {
    // A chave de API nunca deve ser exposta no front-end em um app de produção.
    // Deixando em branco, o ambiente se encarrega de fornecer a chave.
    try {
      const apiKey = "AIzaSyDekVaLj0mtmlXOQfgKKfydQmEw4GjWplY";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const prompt = `Resuma o seguinte texto de uma notícia em português, em um parágrafo conciso: "${textToSummarize}". 
      Faça o resumo em bullet-ponts.
      Todo resumo deve conter um título que resuma o conteúdo da notícia.
      `;

      const payload = {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Erro na API do Gemini: ${response.status} ${errorBody}`
        );
      }

      const data = await response.json();

      if (
        data.candidates &&
        data.candidates.length > 0 &&
        data.candidates[0].content.parts.length > 0
      ) {
        return data.candidates[0].content.parts[0].text;
      } else {
        console.error("Resposta inesperada da API:", data);
        if (data.promptFeedback && data.promptFeedback.blockReason) {
          throw new Error(
            `Resumo bloqueado pela API. Motivo: ${data.promptFeedback.blockReason}`
          );
        }
        throw new Error(
          "Não foi possível gerar o resumo. A resposta da API estava vazia ou em formato incorreto."
        );
      }
    } catch (error) {
      console.error("Erro ao resumir com Gemini:", error);
      throw new Error(
        "Erro ao resumir o texto com a API do Gemini. Verifique a chave de API e a conectividade."
      );
    }
  };

  // --- Renderização do Componente ---
  return (
    <div className="bg-slate-900 min-h-screen flex flex-col items-center justify-center font-sans p-4 text-white">
      <div className="w-full max-w-2xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-cyan-400">
            Resumidor de Notícias
          </h1>
          <p className="text-slate-400 mt-2">
            Cole o link de uma notícia e obtenha um resumo instantâneo com a
            ajuda da IA.
          </p>
        </header>

        <main>
          <form
            onSubmit={handleSummarize}
            className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://g1.globo.com/..."
              className="flex-grow bg-slate-800 border border-slate-700 rounded-md px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              aria-label="URL da Notícia"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-bold py-3 px-6 rounded-md transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center">
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resumindo...
                </>
              ) : (
                "Resumir"
              )}
            </button>
          </form>

          {error && (
            <div
              className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6"
              role="alert">
              <strong className="font-bold">Erro: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* RESUMO */}
          {summary && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-cyan-400 mb-3">
                Resumo Gerado
              </h2>

              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-slate-300 leading-relaxed">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-xl font-bold text-cyan-300 mb-2">
                            {children}
                          </h1>
                        ),
                        li: ({ children }) => (
                          <li className="ml-4 mb-1">{children}</li>
                        ),
                        p: ({ children }) => <p className="mb-2">{children}</p>,
                      }}>
                      {summary}
                    </ReactMarkdown>
                  </p>
                </div>

                <div className="border-t pt-3 border-slate-500">
                  <p>Url original:</p>
                  <Link to={url} target="_blank" rel="noopener noreferrer">
                    <p className="text-slate-300 leading-relaxed hover:underline">
                      {url}
                    </p>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="text-center mt-8 text-slate-500 text-sm">
          <p>Desenvolvido com React & Gemini.</p>
        </footer>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
