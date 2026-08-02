import { Button } from "./Button";

export function ActionDialog({ open, title, children, onClose, onConfirm, confirmLabel = "Save" }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="action-title">
        <h2 id="action-title">{title}</h2>
        <div className="form-grid">{children}</div>
        <div className="modal-actions"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={onConfirm}>{confirmLabel}</Button></div>
      </section>
    </div>
  );
}