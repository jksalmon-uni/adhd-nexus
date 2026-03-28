interface HeaderProps {
  greeting: string;
  colorMap: any;
  setOverwhelmMode: (mode: boolean) => void;
}

export default function Header({
  greeting,
  colorMap,
  setOverwhelmMode,
}: HeaderProps) {
  return (
    <header className="mb-6 text-center mt-2">
      <h1
        className={`text-4xl font-black mb-2 tracking-tight ${colorMap.textMain}`}
      >
        {greeting}
      </h1>
      <button
        onClick={() => {
          setOverwhelmMode(true);
        }}
        className={`text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-full transition-all bg-rose-500/10 text-rose-500 border border-rose-500/20 active:scale-95`}
      >
        ⚠️ I'm Overwhelmed
      </button>
    </header>
  );
}
