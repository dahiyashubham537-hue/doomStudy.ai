import useCardsStore from "../assets/useCardsStore";
import { useState } from "react";
import OpenAI from "openai";
import { useNavigate } from "react-router-dom";
import { extractPdfChunks } from "../assets/pdfParser";
  
export default function LandingPage() {
   const [topic, setTopicInput] = useState("");
   const [file, setFile] = useState(null);
  const setCards = useCardsStore((state) => state.setCards);
  const setTopic = useCardsStore((state) => state.setTopic);
   const cards = useCardsStore((state) => state.cards);
  const savedTopic = useCardsStore((state) => state.topic);
  const setMode=useCardsStore((state)=>state.setMode)
  const setChunks=useCardsStore((state)=>state.setChunks)
  const navigate=useNavigate()
  const [loading,setLoading]=useState(false)
   const handleGenerate = async () => {
  // Check cache first BEFORE overwriting store
    setLoading(true)
  if (
    topic.trim().toLowerCase() === savedTopic.trim().toLowerCase() &&
    cards.length > 0
  ) {
    console.log("⚡ Loaded from cache");
    setMode("topic"); // only set mode here
    setLoading(false)
    navigate("/doom");
    return;
  }

  // Otherwise generate fresh
  setTopic(topic);
  setMode("topic");

  const client = new OpenAI({
    baseURL: "https://router.huggingface.co/v1",
    apiKey: "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",
    dangerouslyAllowBrowser: true,
  });

  const gptQuery = `
Generate 10 very short flashcards (question and answer) based on the topic:

"${topic}"

Rules:
- Questions should be factual and relevant to the real meaning of the topic.
- Answers should be short (1–2 sentences) and accurate.
- If the topic is a person (e.g. an athlete), focus on biography, achievements, career, or impact.
- If the topic is a concept (e.g. photosynthesis), focus on definitions, processes, examples, and applications.
- Do not invent new meanings, folklore, or slang.
- Return only valid JSON. No extra text, no code fences.

Output format:
[
  { "q": "Question here", "a": "Answer here" },
  ...
]
`;

  const gptResults = await client.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [{ role: "user", content: gptQuery }],
  });

  const content = gptResults.choices[0].message.content;
  const gptData = JSON.parse(content);
  setCards(gptData);
  setLoading(false)
  navigate('/doom')

};

const handlePDFGenerate = async () => {
     setLoading(true)
  // Cache guard FIRST
  if (
    topic.trim().toLowerCase() === file.name.trim().toLowerCase() &&
    cards.length > 0 &&
    chunks.length > 0
  ) {
    console.log("⚡ Loaded PDF flashcards from cache");
    setMode("pdf");
    setLoading(false)
    navigate("/doom");
    return;
  }

  // Otherwise generate fresh
  setMode("pdf");

  const chunks = await extractPdfChunks(file);
  setTopic(file.name);
  setChunks(chunks);

  const firstChunk = chunks[0];

  const gptQuery = `
Generate 10 very short flashcards (question and answer) from this text:

"${firstChunk}"

Rules:
- Questions should be factual and relevant to the real meaning of the topic.
- Answers should be short (1–2 sentences) and accurate.
- Return only valid JSON. No extra text, no code fences.

Output format:
[
  { "q": "Question here", "a": "Answer here" },
  ...
]
`;

  const client = new OpenAI({
    baseURL: "https://router.huggingface.co/v1",
    apiKey: "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",
    dangerouslyAllowBrowser: true,
  });

  const gptResults = await client.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [{ role: "user", content: gptQuery }],
  });

  const content = gptResults.choices[0].message.content;
  const gptData = JSON.parse(content);
  setCards(gptData);
  setLoading(false)
  navigate('/doom')
 
};

  return (
     <div className="flex flex-col items-center justify-center h-screen text-center bg-gradient-to-b from-black to-gray-900 text-white">
      {loading ? (
        // shimmer fullscreen
        <div className="flex items-center justify-center h-screen">
          <div className="animate-pulse text-pink-500 text-xl">
            Generating flashcards...
          </div>
        </div>
      ) : (
      <>
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white px-4">
    {/* Header */}
    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500 drop-shadow-lg">
      Doomscroll Your Way to Knowledge 📚
    </h1>
    <p className="mb-10 text-gray-400 text-center max-w-xl">
      Upload a PDF or enter a topic to generate interactive flashcards powered by AI.
    </p>

    {/* Topic input box */}
    <div className="flex w-full max-w-lg gap-2 mb-6">
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopicInput(e.target.value)}
        placeholder="Enter a topic..."
        className="flex-1 px-4 py-3 rounded-xl bg-gray-800/70 backdrop-blur border border-gray-700 
                   text-white focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent 
                   placeholder-gray-500 transition-all"
      />
      <button
        onClick={handleGenerate}
        className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-pink-500 to-purple-500
                   hover:from-pink-400 hover:to-purple-400 transition-all shadow-lg hover:shadow-pink-500/30"
      >
        Generate
      </button>
    </div>

    {/* File upload */}
    <div className="flex flex-col items-center gap-3 w-full max-w-lg">
      <label
        className="w-full cursor-pointer px-6 py-4 rounded-xl border-2 border-dashed border-gray-600 
                   hover:border-pink-400 text-gray-400 hover:text-pink-400 transition-colors text-center"
      >
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="hidden"
        />
        {file ? `📄 ${file.name}` : "Click or drag & drop to upload a PDF"}
      </label>

      <button
        onClick={handlePDFGenerate}
        disabled={!file}
        className={`px-6 py-3 rounded-xl font-semibold w-full max-w-xs transition-all shadow-lg
          ${
            file
              ? "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 hover:shadow-pink-500/30"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          }`}
      >
        Upload PDF
      </button>
    </div>
  </div>
</>

         
      )}
    </div>
  );
}
