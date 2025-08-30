import { useEffect, useRef, useState } from "react";
import Flashcard from "./FlashCard";
import useCardsStore from "../assets/useCardsStore";
import OpenAI from "openai";


export default function DoomScroller() {
 const { cards, appendCards, chunks, currentChunk, nextChunk, mode, topic } = useCardsStore();
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !loading) {
          setLoading(true);
            if (mode === "pdf" && currentChunk + 1 < chunks.length) {
        // 📖 PDF mode → get next chunk
        const chunk = chunks[currentChunk + 1];
         const gptQuery = `
        Generate 10 very short flashcards (question and answer) based on the topic:
        
        "${chunk}"
        
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
              appendCards(gptData);
              nextChunk()
          setLoading(false);
    }
    else{

            const client = new OpenAI({
             baseURL: "https://router.huggingface.co/v1",
             apiKey: "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",
             dangerouslyAllowBrowser: true,
           });
       
           const gptQuery = `
      Generate 10 new flashcards (question and answer) about the topic:

"${topic}"

Requirements:
- Do not repeat any questions that were already asked in previous flashcards.
- Focus on new, relevant aspects of the topic.
- Keep questions short and factual.
- Keep answers concise (1–2 sentences).
- Return only valid JSON. No code fences, no explanations, no commentary.

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
          appendCards(gptData);
          setLoading(false);
        }
    }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [loading, appendCards, topic, currentChunk, chunks, mode,nextChunk]);
  if (loading && cards.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-pink-400">
        <div className="h-20 w-20 border-4 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 animate-pulse">Generating flashcards...</p>
      </div>
    );
  }
return (
  <div className="relative h-screen overflow-y-scroll snap-y snap-mandatory flex justify-center bg-black">
    {/* Background video container */}
    <div className="fixed top-0 left-1/2 -translate-x-1/2 h-full w-[500px]  rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(236,72,153,0.4)]">
      <video
        src="/1306-145340152_small.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="h-full w-full object-cover"
      />
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
    </div>

    {/* Flashcards container */}
    <div className="relative z-10 w-full max-w-[500px] px-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className="h-screen flex justify-center items-center snap-center"
        >
          <Flashcard card={card} />
        </div>
      ))}

      {/* Loader */}
      <div
        ref={loaderRef}
        className="h-40 flex flex-col justify-center items-center text-pink-400 animate-pulse"
      >
        <div className="h-10 w-10 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="tracking-wide">Loading more flashcards...</p>
      </div>
    </div>
  </div>
);


}
