import { GameCard } from "./GameCard";

export function LibrarySection({ games, onOpen, statuses = {}, scores = {}, onStatusChange, onRate }) {
  return (
    <section className="section">
      <div className="section-heading">
        <div><h2>Game Library</h2><p>Everything saved in your diary.</p></div>
        <p>{games.length} games</p>
      </div>
      {games.length ? (
        <div className="game-grid">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onOpen={onOpen}
              status={statuses[game.id]}
              score={scores[game.id]}
              onStatusChange={onStatusChange}
              onRate={onRate}
            />
          ))}
        </div>
      ) : (
        <div className="panel empty-state">No games match the current view.</div>
      )}
    </section>
  );
}