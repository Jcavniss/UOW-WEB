export function CatalogToolbar({ query, genre, genres, onQuery, onGenre }) {
  return (
    <div className="panel toolbar">
      <input aria-label="Search games" placeholder="Search games" value={query} onChange={(event) => onQuery(event.target.value)} />
      <select aria-label="Filter by genre" value={genre} onChange={(event) => onGenre(event.target.value)}>
        <option value="">All genres</option>
        {genres.map((item) => <option value={item} key={item}>{item}</option>)}
      </select>
    </div>
  );
}
