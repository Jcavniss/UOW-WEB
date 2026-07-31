export function ArrowButton({ direction, enabled, onClick }) {
  return <button className="arrow-button" type="button" aria-label={direction === "back" ? "Go back" : "Go forward"} disabled={!enabled} onClick={onClick}>{direction === "back" ? "←" : "→"}</button>;
}
