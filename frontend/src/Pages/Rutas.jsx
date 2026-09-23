import { useState } from "react";
import { Plus, MapPin, Truck, User, Clock, Pencil, Trash2, CheckCircle, X } from "lucide-react";
import "./OrderManagement.css";
import "./Rutas.css";

const INITIAL = [
  { id:1, nombre:"Ruta Norte",    repartidor:"Carlos Mejía",   vehiculo:"Pick-up blanco",  zona:"Ayutuxtepeque, Mejicanos",         paradas:12, estado:"Activa",    hora:"07:30", color:"#22c55e" },
  { id:2, nombre:"Ruta Centro",   repartidor:"Luis Portillo",  vehiculo:"Camión cisterna",  zona:"San Salvador centro, Soyapango",   paradas:18, estado:"En camino", hora:"08:00", color:"#3b82f6" },
  { id:3, nombre:"Ruta Sur",      repartidor:"Héctor Amaya",   vehiculo:"Pick-up plateado", zona:"Antiguo Cuscatlán, Santa Tecla",   paradas:9,  estado:"Pendiente", hora:"09:00", color:"#f97316" },
  { id:4, nombre:"Ruta Oriente",  repartidor:"Mario Cruz",     vehiculo:"Moto con cajón",   zona:"Soyapango este, Ilopango",         paradas:7,  estado:"Activa",    hora:"07:45", color:"#a855f7" },
  { id:5, nombre:"Ruta Occidente",repartidor:"Pedro Ramos",    vehiculo:"Pick-up azul",     zona:"La Libertad, Colón, Armenia",      paradas:14, estado:"Finalizada", hora:"06:30", color:"#06b6d4" },
];

const ESTADO_BADGE = {
  "Activa":    "badge-green",
  "En camino": "badge-blue",
  "Pendiente": "badge-yellow",
  "Finalizada":"badge-purple",
};

function RutaModal({ ruta, onClose, onSave }) {
  const [form, setForm] = useState(ruta || { nombre:"", repartidor:"", vehiculo:"", zona:"", hora:"07:00", estado:"Pendiente" });
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <h3>{ruta?"Editar ruta":"Nueva ruta"}</h3>
          <button className="modal-close" onClick={onClose}><X size={16}/></button>
        </div>
        <div className="modal-grid">
          <div className="field" style={{gridColumn:"1/-1"}}>
            <label>Nombre de la ruta</label>
            <input value={form.nombre} onChange={set("nombre")} placeholder="Ej: Ruta Norte"/>
          </div>
          <div className="field">
            <label>Repartidor</label>
            <input value={form.repartidor} onChange={set("repartidor")} placeholder="Nombre del repartidor"/>
          </div>
          <div className="field">
            <label>Vehículo</label>
            <input value={form.vehiculo} onChange={set("vehiculo")} placeholder="Tipo de vehículo"/>
          </div>
          <div className="field" style={{gridColumn:"1/-1"}}>
            <label>Zona / Municipios</label>
            <input value={form.zona} onChange={set("zona")} placeholder="Ej: Ayutuxtepeque, Mejicanos"/>
          </div>
          <div className="field">
            <label>Hora de salida</label>
            <input type="time" value={form.hora} onChange={set("hora")}/>
          </div>
          <div className="field">
            <label>Estado</label>
            <select value={form.estado} onChange={set("estado")}>
              {["Pendiente","Activa","En camino","Finalizada"].map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-save" onClick={()=>onSave(form)}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

export default function Rutas() {
  const [rutas, setRutas] = useState(INITIAL);
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const handleSave = data => {
    if (modal.ruta) {
      setRutas(rs => rs.map(r => r.id===modal.ruta.id ? {...r,...data} : r));
    } else {
      setRutas(rs => [...rs, {...data, id:Date.now(), paradas:0, color:"#06b6d4"}]);
    }
    setModal(null);
  };

  const handleDelete = id => { setRutas(rs=>rs.filter(r=>r.id!==id)); setDeleteId(null); };

  return (
    <div className="page">
      <div className="page-topbar">
        <p className="page-subtitle">Gestiona las rutas de entrega y repartidores.</p>
        <button className="btn-add" onClick={() => setModal({ ruta:null })}>
          <Plus size={15}/> Nueva ruta
        </button>
      </div>

      <div className="rutas-grid">
        {rutas.map(r => (
          <div key={r.id} className="ruta-card">
            <div className="ruta-card-header">
              <div style={{display:"flex",alignItems:"flex-start",gap:10,flex:1}}>
                <div className="ruta-dot" style={{background:r.color}}/>
                <div>
                  <p className="ruta-card-title">{r.nombre}</p>
                  <p className="ruta-card-zone"><MapPin size={11} style={{display:"inline",marginRight:4}}/>{r.zona}</p>
                </div>
              </div>
              <span className={`badge ${ESTADO_BADGE[r.estado]}`}>{r.estado}</span>
            </div>
            <div className="ruta-card-body">
              <div className="ruta-info-row"><User size={13}/> {r.repartidor}</div>
              <div className="ruta-info-row"><Truck size={13}/> {r.vehiculo}</div>
              <div className="ruta-info-row"><Clock size={13}/> Salida: {r.hora}</div>
            </div>
            <div className="ruta-card-footer">
              <p className="ruta-stops"><span>{r.paradas}</span> paradas</p>
              <div className="ruta-actions">
                <button className="act-btn act-edit" title="Editar" onClick={()=>setModal({ruta:r})}>
                  <Pencil size={13}/>
                </button>
                <button className="act-btn act-del" title="Eliminar" onClick={()=>setDeleteId(r.id)}>
                  <Trash2 size={13}/>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && <RutaModal ruta={modal.ruta} onClose={()=>setModal(null)} onSave={handleSave}/>}
      {deleteId && (
        <div className="modal-overlay" onClick={()=>setDeleteId(null)}>
          <div className="modal-card confirm" onClick={e=>e.stopPropagation()}>
            <h3>¿Eliminar ruta?</h3>
            <p>Esta acción es irreversible.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={()=>setDeleteId(null)}>Cancelar</button>
              <button className="btn-danger" onClick={()=>handleDelete(deleteId)}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
