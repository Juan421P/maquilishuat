export default function ConfirmDialog({ title, message, onCancel, onConfirm, confirming, confirmLabel = "Eliminar" }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card confirm" onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onCancel}>Cancelar</button>
          <button className="btn-danger" onClick={onConfirm} disabled={confirming}>
            {confirming ? `${confirmLabel === "Eliminar" ? "Eliminando" : confirmLabel}...` : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
