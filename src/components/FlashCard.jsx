export default function Flashcard({ card }) {
  return (
   <div className="group [perspective:1000px] w-80 h-48">
  <div
    className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]"
  >
    {/* Front Side */}
    <div className="absolute inset-0 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 flex flex-col justify-center items-center [backface-visibility:hidden]">
      <p className="text-lg font-semibold text-gray-900">{card.q}</p>
    </div>

    {/* Back Side */}
    <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl shadow-xl p-6 flex flex-col justify-center items-center text-white text-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
      <p className="text-xl font-bold">{card.a}</p>
    </div>
  </div>
</div>

  );
}
