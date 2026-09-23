import { useState } from "react";
import { Search, DollarSign, CheckCircle, Clock, XCircle, TrendingUp, Plus, Pencil, X } from "lucide-react";
import "./OrderManagement.css";
import "./Pagos.css";

const INITIAL = [
  { id:1, folio:"#P-0021", cliente:"Juan Pérez",    pedido:"#0042", monto:25.00, metodo:"Efectivo",      estado:"Pagado",    fecha:"2026-04-18", color:"#14b8a6" },
  { id:2, folio:"#P-0020", cliente:"María López",   pedido:"#0041", monto:55.00, metodo:"Transferencia", estado:"Pagado",    fecha:"2026-04-18", color:"#3b82f6" },
  { id:3, folio:"#P-0019", cliente:"Luis Gómez",    pedido:"#0038", monto:50.00, metodo:"Efectivo",      estado:"Pendiente", fecha:"2026-04-16", color:"#22c55e" },
  { id:4, folio:"#P-0018", cliente:"Ana Martínez",  pedido:"#0039", monto:36.00, metodo:"Tarjeta",       estado:"Pagado",    fecha:"2026-04-17", color:"#f97316" },
  { id:5, folio:"#P-0017", cliente:"Carlos Rivera", pedido:"#0040", monto:10.00, metodo:"Efectivo",      estado:"Pagado",    fecha:"2026-04-17", color:"#a855f7" },
  { id:6, folio:"#P-0016", cliente:"Pedro Flores",  pedido:"#0037", monto:75.00, metodo:"Transferencia", estado:"Pendiente", fecha:"2026-04-15", color:"#06b6d4" },
  { id:7, folio:"#P-0015", cliente:"Rosa Chávez",   pedido:"#0036", monto:30.00, metodo:"Tarjeta",       estado:"Rechazado", fecha:"2026-04-14", color:"#f59e0b" },
];

const METODOS = ["Todos","Efectivo","Transferencia","Tarjeta"];
const ESTADO_BADGE = { "Pagado":"badge-green","Pendiente":"badge-yellow","Rechazado":"badge-red" };

function PagoModal({ pago, onClose, onSave }) {
  const [form, setForm] = useState(pago || {
    cliente:"", pedido:"", monto:"", metodo:"Efectivo",
    estado:"Pendiente", fecha: new Date().toISOString().slice(0,10),
  });
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <h3>{pago ? "Editar pago" : "Registrar pago"}</h3>
          <button className="modal-close" onClick={onClose}><X size={16}/></button>
        </div>
        <div className="modal-grid">
          <div className="field">
            <label>Cliente</label>
            <input value={form.cliente} onChange={set("cliente")} placeholder="Nombre del cliente"/>
          </div>
          <div className="field">
            <label>Pedido</label>
            <input value={form.pedido} onChange={set("pedido")} placeholder="#0000"/>
          </div>
          <div className="field">
            <label>Monto ($)</label>
            <input type="number" step="0.01" value={form.monto} onChange={set("monto")} placeholder="0.00"/>
          </div>
          <div className="field">
            <label>Fecha</label>
            <input type="date" value={form.fecha} onChange={set("fecha")}/>
          </div>
          <div className="field">
            <label>Método de pago</label>
            <select value={form.metodo} onChange={set("metodo")}>
              {["Efectivo","Transferencia","Tarjeta"].map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Estado</label>
            <select value={form.estado} onChange={set("estado")}>
              {["Pendiente","Pagado","Rechazado"].map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-save" onClick={()=>onSave({...form,monto:parseFloat(form.monto)||0})}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

export default function Pagos() {
  const [pagos, setPagos] = useState(INITIAL);
  const [search, setSearch] = useState("");
  const [metodo, setMetodo] = useState("Todos");
  const [modal, setModal] = useState(null);

  const filtered = pagos.filter(p => {
    const ms = p.cliente.toLowerCase().includes(search.toLowerCase()) ||
               p.folio.toLowerCase().includes(search.toLowerCase());
    const mm = metodo === "Todos" || p.metodo === metodo;
    return ms && mm;
  });

  const handleSave = data => {
    if (modal.pago) {
      setPagos(ps => ps.map(p => p.id===modal.pago.id ? {...p,...data} : p));
    } else {
      setPagos(ps => [{...data, id:Date.now(),
        folio:`#P-${String(ps.length+22).padStart(4,"0")}`, color:"#14b8a6",
      }, ...ps]);
    }
    setModal(null);
  };

  const cobrado   = pagos.filter(p=>p.estado==="Pagado").reduce((a,p)=>a+p.monto,0);
  const pendiente = pagos.filter(p=>p.estado==="Pendiente").reduce((a,p)=>a+p.monto,0);
  const total     = pagos.reduce((a,p)=>a+p.monto,0);

  return (
    <div className="page">
      <div className="page-topbar">
        <p className="page-subtitle">Registra y controla todos los cobros.</p>
        <button className="btn-add" onClick={()=>setModal({pago:null})}>
          <Plus size={15}/> Registrar pago
        </button>
      </div>

      <div className="pagos-kpi">
        <div className="pago-kpi-card kpi-green">
          <div className="pago-kpi-icon"><CheckCircle size={19}/></div>
          <div>
            <p className="pago-kpi-label">Cobrado</p>
            <p className="pago-kpi-val">${cobrado.toFixed(2)}</p>
          </div>
        </div>
        <div className="pago-kpi-card kpi-yellow">
          <div className="pago-kpi-icon"><Clock size={19}/></div>
          <div>
            <p className="pago-kpi-label">Por cobrar</p>
            <p className="pago-kpi-val">${pendiente.toFixed(2)}</p>
          </div>
        </div>
        <div className="pago-kpi-card kpi-teal">
          <div className="pago-kpi-icon"><TrendingUp size={19}/></div>
          <div>
            <p className="pago-kpi-label">Total facturado</p>
            <p className="pago-kpi-val">${total.toFixed(2)}</p>
          </div>
        </div>
        <div className="pago-kpi-card kpi-blue">
          <div className="pago-kpi-icon"><DollarSign size={19}/></div>
          <div>
            <p className="pago-kpi-label">Transacciones</p>
            <p className="pago-kpi-val">{pagos.length}</p>
          </div>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={14}/>
          <input placeholder="Buscar por cliente o folio..." value={search}
            onChange={e=>setSearch(e.target.value)}/>
        </div>
        <div className="filter-tabs">
          {METODOS.map(m=>(
            <button key={m} className={`filter-tab ${metodo===m?"active":""}`}
              onClick={()=>setMetodo(m)}>{m}</button>
          ))}
        </div>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Folio</th><th>Cliente</th><th>Pedido</th>
                <th>Monto</th><th>Método</th><th>Estado</th><th>Fecha</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length===0 && (
                <tr><td colSpan={8} className="empty-row">Sin resultados para esta búsqueda.</td></tr>
              )}
              {filtered.map(p => (
                <tr key={p.id}>
                  <td className="order-id">{p.folio}</td>
                  <td>
                    <div className="client-cell">
                      <div className="c-avatar" style={{background:p.color}}>
                        {p.cliente.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
                      </div>
                      <span>{p.cliente}</span>
                    </div>
                  </td>
                  <td className="order-id">{p.pedido}</td>
                  <td className="monto-cell">${p.monto.toFixed(2)}</td>
                  <td><span className="metodo-tag">{p.metodo}</span></td>
                  <td><span className={`badge ${ESTADO_BADGE[p.estado]}`}>{p.estado}</span></td>
                  <td className="fecha-cell">{p.fecha}</td>
                  <td>
                    <div className="action-row">
                      <button className="act-btn act-edit" title="Editar"
                        onClick={()=>setModal({pago:p})}>
                        <Pencil size={13}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && <PagoModal pago={modal.pago} onClose={()=>setModal(null)} onSave={handleSave}/>}
    </div>
  );
}
