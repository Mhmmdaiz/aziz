"use client";

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
}

export default function CategoryFilter({ categories, activeCategory, setActiveCategory }: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-4 overflow-x-auto pb-6 no-scrollbar snap-x">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setActiveCategory(cat)}
          className={`px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all whitespace-nowrap snap-center border ${
            activeCategory === cat
              ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              : "bg-zinc-900 text-zinc-500 border-white/5 hover:border-white/20 hover:text-white"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
