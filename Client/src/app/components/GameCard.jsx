export function GameCard({ game, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 focus:outline-none text-left w-full"
    >
      <div
        className="relative flex items-center justify-center"
        style={{ height: "160px", backgroundColor: game.color + "18" }}
      >
        <div
          className="size-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg group-hover:scale-105 transition-transform duration-300"
          style={{
            backgroundColor: game.color,
            fontFamily: "var(--font-display)",
          }}
        >
          {game.initials}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-card to-transparent" />
      </div>

      <div className="px-4 pb-4 pt-3 flex flex-col gap-1.5">
        <h3
          className="text-foreground font-bold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {game.name}
        </h3>
        <span className="text-xs text-muted-foreground">{game.genre}</span>
      </div>
    </button>
  );
}
