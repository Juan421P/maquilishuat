import { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2, CheckCircle, Clock, Truck, XCircle, ChevronRight, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import StatusBadge from "../components/StatusBadge";
import { salesAPI } from "../services/api";
import "./OrderManagement.css";

const ESTADOS_PAGO = ["pending", "paid", "partial"];
const ESTADOS_PAGO_LABEL = { pending: "Pendiente", paid: "Pagado", partial: "Parcial" };
const PAGO_VARIANT = { paid: "green", partial: "yellow", pending: "red" };

const METODOS_PAGO = ["Efectivo", "Transferencia", "Tarjeta", "Otro"];

function PedidoModal({ pedido, onClose, onSave }) {
  const [form, setForm] = useState(pedido
    ? {
        delivery_address: pedido.delivery_address || "",
        payment_method: pedido.payment_method || "Efectivo",
        payment_status: pedido.payment_status || "pending",
      }
    : {
        delivery_address: "",
        payment_method: "Efectivo",
        payment_status: "pending",
      }
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.delivery_address.trim()) { setErr("La dirección es obligatoria"); return; }
    setSaving(true);
    setErr("");
    try {
      if (pedido) {
        await salesAPI.update(pedido._id, form);
        toast.success("Pedido actualizado");
      }
      onSave();
    } catch (e) {
      setErr(e.message || "Error al guardar");
      toast.error(e.message || "Error al guardar el pedido");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={pedido ? "Editar pedido" : "Detalle de pedido"}
      onClose={onClose}
      footer={<>
        <button className="btn-cancel" onClick={onClose}>Cancelar</button>
        {pedido && <button className="btn-save" onClick={handleSave} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>}
      </>}
    >
      {err && <div style={{ background: "#fee2e2", color: "#dc2626", padding: "8px 12px", borderRadius: 6, fontSize: 13, margin: "0 22px 10px" }}>{err}</div>}
      <div className="modal-grid">
        <div className="field" style={{ gridColumn: "1/-1" }}>
          <label>Dirección de entrega</label>
          <input value={form.delivery_address} onChange={set("delivery_address")} placeholder="Col. Escalón, San Salvador" />
        </div>
        <div className="field">
          <label>Método de pago</label>
          <select value={form.payment_method} onChange={set("payment_method")}>
            {METODOS_PAGO.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Estado de pago</label>
          <select value={form.payment_status} onChange={set("payment_status")}>
            {ESTADOS_PAGO.map(s => <option key={s} value={s}>{ESTADOS_PAGO_LABEL[s]}</option>)}
          </select>
        </div>
      </div>
    </Modal>
  );
}

export default function OrderManagement() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await salesAPI.getAll();
      setPedidos(data);
    } catch (e) {
      setError(e.message || "Error al cargar pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const getPaymentLabel = (status) => ESTADOS_PAGO_LABEL[status] || status || "—";

  const filtered = pedidos.filter(p => {
    const addr = (p.delivery_address || "").toLowerCase();
    const id = (p._id || "").toLowerCase();
    const ms = addr.includes(search.toLowerCase()) || id.includes(search.toLowerCase());
    const mf = filter === "Todos" || p.payment_status === filter;
    return ms && mf;
  });

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await salesAPI.delete(id);
      setDeleteId(null);
      load();
      toast.success("Pedido eliminado");
    } catch (e) {
      toast.error(e.message || "Error al eliminar");
    } finally {
      setDeleting(false);
    }
  };

  const totals = {
    total: pedidos.length,
    paid: pedidos.filter(p => p.payment_status === "paid").length,
    pending: pedidos.filter(p => p.payment_status === "pending").length,
    partial: pedidos.filter(p => p.payment_status === "partial").length,
  };

  const fmt = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("es-SV", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div className="page">
      <div className="page-topbar">
        <div><p className="page-subtitle">Administra y da seguimiento a todos los pedidos/ventas.</p></div>
        <button className="btn-add" style={{ background: "var(--gray-100)", color: "var(--text-secondary)" }} onClick={load}>
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="summary-chips">
        {[
          { label: "Total", val: totals.total, cls: "" },
          { label: "Pagados", val: totals.paid, cls: "chip-green" },
          { label: "Pendientes", val: totals.pending, cls: "chip-yellow" },
          { label: "Parciales", val: totals.partial, cls: "chip-blue" },
        ].map(c => (
          <div key={c.label} className={`chip ${c.cls}`}>
            <span className="chip-val">{c.val}</span>
            <span className="chip-label">{c.label}</span>
          </div>
        ))}
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={14} />
          <input placeholder="Buscar por dirección o ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-tabs">
          {["Todos", "paid", "pending", "partial"].map(e => (
            <button key={e} className={`filter-tab ${filter === e ? "active" : ""}`} onClick={() => setFilter(e)}>
              {e === "Todos" ? "Todos" : ESTADOS_PAGO_LABEL[e]}
            </button>
          ))}
        </div>
      </div>

      {error && <div style={{ background: "#fee2e2", color: "#dc2626", padding: "12px 16px", borderRadius: 8, marginBottom: 16 }}><AlertCircle size={14} style={{ display: "inline", marginRight: 6 }} />{error}</div>}

      <div className="table-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Dirección de entrega</th><th>Método pago</th>
                <th>Estado pago</th><th>Fecha</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="empty-row">Cargando...</td></tr>}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="empty-row">{pedidos.length === 0 ? "No hay pedidos registrados." : "Sin resultados."}</td></tr>
              )}
              {!loading && filtered.map(p => (
                <tr key={p._id}>
                  <td className="order-id" title={p._id}>{p._id.slice(-6).toUpperCase()}</td>
                  <td>{p.delivery_address || "—"}</td>
                  <td>{p.payment_method || "—"}</td>
                  <td>
                    <StatusBadge variant={PAGO_VARIANT[p.payment_status]}>
                      {getPaymentLabel(p.payment_status)}
                    </StatusBadge>
                  </td>
                  <td className="fecha-cell">{fmt(p.createdAt)}</td>
                  <td>
                    <div className="action-row">
                      <button className="act-btn act-edit" title="Editar" onClick={() => setModal({ pedido: p })}>
                        <Pencil size={13} />
                      </button>
                      <button className="act-btn act-del" title="Eliminar" onClick={() => setDeleteId(p._id)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && <PedidoModal pedido={modal.pedido} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />}
      {deleteId && (
        <ConfirmDialog
          title="¿Eliminar pedido?"
          message="Esta acción es irreversible."
          onCancel={() => setDeleteId(null)}
          onConfirm={() => handleDelete(deleteId)}
          confirming={deleting}
        />
      )}
    </div>
  );
}
