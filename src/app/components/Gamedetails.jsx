import { Button } from "./Button";

export function GameDetails({ game, onHome, onAdd, inLibrary, onRate, score }) {
  if (!game) return null;
  return (
    <section className="section details">
      <aside className="panel details-side">
        <div className="details-logo" style={{ backgroundColor: game.color }}>{game.initials}</div>
        <div className="platforms">{game.platforms?.map((platform) => <span className="tag" key={platform}>{platform}</span>)}</div>
      </aside>
      <article className="panel details-main">
        <span className="eyebrow">{game.genre}</span>
        <h1>{game.name}</h1>
        <div className="game-meta">{game.studio} · {game.releaseDate}</div>
        <p>{game.description || "Game details will be expanded as the product develops."}</p>
        <div className="details-actions">
          <Button variant="secondary" onClick={onHome}>Back to dashboard</Button>
          {onAdd && <Button onClick={() => onAdd(game)}>{inLibrary ? "Remove from library" : "Add to library"}</Button>}
          {onRate && (
            <label className="field">
              Your score
              <select value={score || ""} onChange={(event) => onRate(game, Number(event.target.value))}>
                <option value="">Not rated</option>
                {[1,2,3,4,5,6,7,8,9,10].map((value) => <option key={value} value={value}>{value}/10</option>)}
              </select>
            </label>
          )}
        </div>
      </article>
    </section>
  );
}