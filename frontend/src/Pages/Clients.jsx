import { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2, Phone, MapPin, Calendar, RefreshCw, X, AlertCircle } from "lucide-react";
import { clientsAPI } from "../services/api";
import "./OrderManagement.css";
import "./Clients.css";

const COLORS = ["#06b6d4", "#3b82f6", "#a855f7", "#f97316", "#22c55e", "#14b8a6", "#f59e0b"];

function ini(name, lastname) {
  return `${(name || "?")[0]}${(lastname || "")[0] || ""}`.toUpperCase();
}

function ClientModal({ client, onClose, onSave }) {
  const [form, setForm] = useState(
    client
      ? { name: client.name || "", lastname: client.lastname || "", email: client.email || "" }
      : { name: "", lastname: "", email: "" }
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) { setErr("Nombre y correo son obligatorios"); return; }
    setSaving(true);
    setErr("");
    try {
      if (client) {
        const fd = new FormData();
        fd.append("name", form.name);
        fd.append("lastname", form.lastname);
        fd.append("email", form.email);
        fd.append("password", "placeholder_no_change");
        await clientsAPI.update(client._id, fd);
      }
      onSave();
    } catch (e) {
      setErr(e.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{client ? "Editar cliente" : "Ver cliente"}</h3>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        {err && <div style={{ background: "#fee2e2", color: "#dc2626", padding: "8px 12px", borderRadius: 6, fontSize: 13, marginBottom: 10 }}><AlertCircle size={13} style={{ display: "inline", marginRight: 6 }} />{err}</div>}
        <div className="modal-grid">
          <div className="field">
            <label>Nombre</label>
            <input value={form.name} onChange={set("name")} placeholder="Nombre" />
          </div>
          <div className="field">
            <label>Apellido</label>
            <input value={form.lastname} onChange={set("lastname")} placeholder="Apellido" />
          </div>
          <div className="field" style={{ gridColumn: "1/-1" }}>
            <label>Correo electrónico</label>
            <input value={form.email} onChange={set("email")} placeholder="correo@ejemplo.com" />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          {client && (
            <button className="btn-save" onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await clientsAPI.getAll();
      setClients(data);
    } catch (e) {
      setError(e.message || "Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = clients.filter(c =>
    `${c.name} ${c.lastname}`.toLowerCase().includes(search.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await clientsAPI.delete(id);
      setDeleteId(null);
      load();
    } catch (e) {
      alert(e.message || "Error al eliminar");
    } finally {
      setDeleting(false);
    }
  };

  const fmt = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("es-SV", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div className="page">
      <div className="page-topbar">
        <p className="page-subtitle">Clientes registrados en el sistema.</p>
        <button className="btn-add" style={{ background: "var(--gray-100)", color: "var(--text-secondary)" }} onClick={load}>
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={14} />
          <input placeholder="Buscar cliente o correo..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {error && <div style={{ background: "#fee2e2", color: "#dc2626", padding: "12px 16px", borderRadius: 8, marginBottom: 16 }}><AlertCircle size={14} style={{ display: "inline", marginRight: 6 }} />{error}</div>}
      {loading && <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-muted)" }}>Cargando...</div>}

      {!loading && (
        <div className="clients-grid">
          {filtered.length === 0 && (
            <p style={{ color: "var(--text-muted)", textAlign: "center", gridColumn: "1/-1", padding: "48px 0" }}>
              {clients.length === 0 ? "No hay clientes registrados." : "No se encontraron clientes."}
            </p>
          )}
          {filtered.map((c, i) => (
            <div key={c._id} className="client-card">
              <div className="client-card-header">
                <div className="client-card-avatar" style={{ background: COLORS[i % COLORS.length] }}>
                  {ini(c.name, c.lastname)}
                </div>
                <div>
                  <p className="client-card-name">{c.name} {c.lastname}</p>
                  <div className="client-card-status">
                    <span className={`badge ${c.verified_email ? "badge-green" : "badge-yellow"}`}>
                      {c.verified_email ? "Verificado" : "Sin verificar"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="client-card-info">
                <div className="client-info-row"><Phone size={13} /> {c.email}</div>
                {c.birthdate && <div className="client-info-row"><Calendar size={13} /> {fmt(c.birthdate)}</div>}
              </div>
              <div className="client-card-actions">
                <button className="client-action-btn edit" onClick={() => setModal({ client: c })}>
                  <Pencil size={12} style={{ display: "inline", marginRight: 4 }} /> Ver / Editar
                </button>
                <button className="client-action-btn delete" onClick={() => setDeleteId(c._id)}>
                  <Trash2 size={12} style={{ display: "inline", marginRight: 4 }} /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && <ClientModal client={modal.client} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-card confirm" onClick={e => e.stopPropagation()}>
            <h3>¿Eliminar cliente?</h3>
            <p>Esta acción es irreversible y eliminará todos los datos del cliente.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteId(null)}>Cancelar</button>
              <button className="btn-danger" onClick={() => handleDelete(deleteId)} disabled={deleting}>
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
