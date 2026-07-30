export function GameCard({ game, onOpen, status, onStatusChange, score, onRate }) {
  return (
    <article className="game-card">
      <button className="game-card-main" type="button" onClick={() => onOpen?.(game)}>
        <span className="game-logo" style={{ backgroundColor: game.color }}>{game.initials}</span>
        <span className="game-copy">
          <h3>{game.name}</h3>
          <span className="game-meta">{game.genre} · {game.studio}</span>
          <span className="platforms">
            {game.platforms.map((platform) => <span className="tag" key={platform}>{platform}</span>)}
          </span>
        </span>
      </button>

    </article>
  );
}