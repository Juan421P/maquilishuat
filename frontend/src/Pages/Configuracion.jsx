import { useState, useCallback, useEffect } from "react";
import {
  Sun, Moon, Bell, Lock, User, Building2, Palette,
  Shield, Check, Save, Eye, EyeOff, RefreshCw,
  AlertTriangle, CheckCircle2, Trash2, Download, X
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import "./Configuracion.css";

const STORAGE_KEY = "ptc_config_v1";

const ACCENT_COLORS = [
  { id:"cyan",   label:"Cyan",    grad:"linear-gradient(135deg,#67e8f9,#06b6d4,#0e7490)" },
  { id:"blue",   label:"Azul",    grad:"linear-gradient(135deg,#93c5fd,#3b82f6,#1d4ed8)" },
  { id:"green",  label:"Verde",   grad:"linear-gradient(135deg,#86efac,#22c55e,#15803d)" },
  { id:"orange", label:"Naranja", grad:"linear-gradient(135deg,#fdba74,#f97316,#ea580c)" },
  { id:"purple", label:"Violeta", grad:"linear-gradient(135deg,#d8b4fe,#a855f7,#7e22ce)" },
  { id:"pink",   label:"Rosa",    grad:"linear-gradient(135deg,#f9a8d4,#ec4899,#9333ea)" },
];

const DEFAULT_CONFIG = {
  perfil:     { nombre:"Admin User", email:"admin@maquilishuat.com", telefono:"7800-0000", cargo:"Administrador" },
  empresa:    { nombre:"Maquilishuat S.A. de C.V.", nit:"0614-XXXXX-XXX-X", direccion:"Col. Escalón, San Salvador", telefono:"2222-0000", web:"www.maquilishuat.com" },
  notifs:     { nuevoPedido:true, pagoRecibido:true, entrega:true, stockBajo:true, email:false, sms:false, sonido:true, desktop:false },
  apariencia: { accent:"cyan", fontSize:"medium", sidebarCompact:false, animaciones:true },
  seguridad:  { twofa:false, sessionTimeout:"60", loginLog:true },
};

const NOTIF_ITEMS = [
  { key:"nuevoPedido",  label:"Nuevo pedido recibido",        sub:"Alerta cuando llega un pedido" },
  { key:"pagoRecibido", label:"Pago confirmado",              sub:"Cuando se registra un pago exitoso" },
  { key:"entrega",      label:"Pedido entregado",             sub:"Confirmación de entrega al cliente" },
  { key:"stockBajo",    label:"Stock bajo",                   sub:"Cuando un producto está por agotarse" },
  { key:"email",        label:"Notificaciones por correo",    sub:"Recibe alertas en tu email" },
  { key:"sms",          label:"Notificaciones por SMS",       sub:"Alertas urgentes por mensaje" },
  { key:"sonido",       label:"Sonido de notificación",       sub:"Reproducir sonido al recibir alertas" },
  { key:"desktop",      label:"Notificaciones de escritorio", sub:"Alertas del navegador en segundo plano" },
];

function Toggle({ on, onChange }) {
  return (
    <button className={`toggle ${on?"on":"off"}`} onClick={() => onChange(!on)}>
      <span className="toggle-thumb"/>
    </button>
  );
}

function useLocalConfig() {
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        return {
          perfil:     { ...DEFAULT_CONFIG.perfil,     ...p.perfil },
          empresa:    { ...DEFAULT_CONFIG.empresa,    ...p.empresa },
          notifs:     { ...DEFAULT_CONFIG.notifs,     ...p.notifs },
          apariencia: { ...DEFAULT_CONFIG.apariencia, ...p.apariencia },
          seguridad:  { ...DEFAULT_CONFIG.seguridad,  ...p.seguridad },
        };
      }
    } catch {}
    return DEFAULT_CONFIG;
  });

  const save = useCallback(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); } catch {}
  }, [config]);

  const update = useCallback((section, key, value) => {
    setConfig(c => ({ ...c, [section]: { ...c[section], [key]: value } }));
  }, []);

  return { config, save, update, setConfig };
}

const NAV_TABS = [
  { id:"perfil",     label:"Perfil",       icon:User },
  { id:"empresa",    label:"Empresa",      icon:Building2 },
  { id:"notifs",     label:"Notificaciones",icon:Bell },
  { id:"apariencia", label:"Apariencia",   icon:Palette },
  { id:"seguridad",  label:"Seguridad",    icon:Shield },
];

export default function Configuracion() {
  const { config, save, update, setConfig } = useLocalConfig();
  const { isDark, toggle } = useTheme();
  const [tab, setTab] = useState("perfil");
  const [saved, setSaved] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [pwds, setPwds] = useState({ actual:"", nueva:"", confirmar:"" });

  const handleSave = () => {
    save();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const set = (sec, key) => e => update(sec, key, e.target.value);
  const setToggle = (sec, key) => val => update(sec, key, val);

  return (
    <div className="page">
      <div className="page-topbar">
        <p className="page-subtitle">Personaliza tu cuenta y el comportamiento del sistema.</p>
      </div>

      <div className="config-layout">
        {/* Sidebar nav */}
        <div className="config-nav">
          {NAV_TABS.map(t => (
            <button key={t.id} className={`config-nav-item ${tab===t.id?"active":""}`} onClick={()=>setTab(t.id)}>
              <t.icon size={15}/> {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {tab === "perfil" && (
            <div className="config-section">
              <h3 className="config-section-title">Datos del perfil</h3>
              <div className="config-field-grid">
                {[
                  {k:"nombre",   label:"Nombre completo",  placeholder:"Tu nombre"},
                  {k:"cargo",    label:"Cargo",             placeholder:"Administrador"},
                  {k:"email",    label:"Correo electrónico",placeholder:"correo@empresa.com"},
                  {k:"telefono", label:"Teléfono",          placeholder:"7800-0000"},
                ].map(f => (
                  <div key={f.k} className="field">
                    <label>{f.label}</label>
                    <input value={config.perfil[f.k]} onChange={set("perfil",f.k)} placeholder={f.placeholder}/>
                  </div>
                ))}
              </div>
              <div className="config-save-bar">
                {saved && <span className="config-saved-msg"><CheckCircle2 size={15}/>Guardado</span>}
                <button className="btn-save" style={{marginLeft:"auto"}} onClick={handleSave}>
                  <Save size={14} style={{marginRight:6}}/>Guardar cambios
                </button>
              </div>
            </div>
          )}

          {tab === "empresa" && (
            <div className="config-section">
              <h3 className="config-section-title">Información de la empresa</h3>
              <div className="config-field-grid">
                {[
                  {k:"nombre",    label:"Nombre legal",   placeholder:"Maquilishuat S.A. de C.V.", col:"1/-1"},
                  {k:"nit",       label:"NIT",             placeholder:"0614-XXXXX-XXX-X"},
                  {k:"telefono",  label:"Teléfono",        placeholder:"2222-0000"},
                  {k:"direccion", label:"Dirección",       placeholder:"Col. Escalón, San Salvador", col:"1/-1"},
                  {k:"web",       label:"Sitio web",       placeholder:"www.empresa.com"},
                ].map(f => (
                  <div key={f.k} className="field" style={f.col?{gridColumn:f.col}:{}}>
                    <label>{f.label}</label>
                    <input value={config.empresa[f.k]} onChange={set("empresa",f.k)} placeholder={f.placeholder}/>
                  </div>
                ))}
              </div>
              <div className="config-save-bar">
                {saved && <span className="config-saved-msg"><CheckCircle2 size={15}/>Guardado</span>}
                <button className="btn-save" style={{marginLeft:"auto"}} onClick={handleSave}>
                  <Save size={14} style={{marginRight:6}}/>Guardar cambios
                </button>
              </div>
            </div>
          )}

          {tab === "notifs" && (
            <div className="config-section">
              <h3 className="config-section-title">Notificaciones</h3>
              <div className="notif-toggle-list">
                {NOTIF_ITEMS.map(item => (
                  <div key={item.key} className="notif-toggle-item">
                    <div className="notif-toggle-text">
                      <p className="notif-toggle-label">{item.label}</p>
                      <p className="notif-toggle-sub">{item.sub}</p>
                    </div>
                    <Toggle on={config.notifs[item.key]} onChange={setToggle("notifs",item.key)}/>
                  </div>
                ))}
              </div>
              <div className="config-save-bar">
                {saved && <span className="config-saved-msg"><CheckCircle2 size={15}/>Guardado</span>}
                <button className="btn-save" style={{marginLeft:"auto"}} onClick={handleSave}>
                  <Save size={14} style={{marginRight:6}}/>Guardar cambios
                </button>
              </div>
            </div>
          )}

          {tab === "apariencia" && (
            <div className="config-section">
              <h3 className="config-section-title">Apariencia</h3>

              <div className="field">
                <label>Tema</label>
                <div className="toggle-row">
                  <span>{isDark ? "Modo oscuro" : "Modo claro"}</span>
                  <Toggle on={isDark} onChange={toggle}/>
                </div>
              </div>

              <div className="field">
                <label>Color de acento</label>
                <div className="color-swatches">
                  {ACCENT_COLORS.map(c => (
                    <div key={c.id}
                      className={`color-swatch ${config.apariencia.accent===c.id?"selected":""}`}
                      style={{background:c.grad}}
                      onClick={() => update("apariencia","accent",c.id)}
                      title={c.label}
                    >
                      {config.apariencia.accent===c.id && (
                        <div className="check"><Check size={16}/></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="field">
                <label>Animaciones</label>
                <div className="toggle-row">
                  <span>Activar animaciones de interfaz</span>
                  <Toggle on={config.apariencia.animaciones} onChange={setToggle("apariencia","animaciones")}/>
                </div>
              </div>

              <div className="config-save-bar">
                {saved && <span className="config-saved-msg"><CheckCircle2 size={15}/>Guardado</span>}
                <button className="btn-save" style={{marginLeft:"auto"}} onClick={handleSave}>
                  <Save size={14} style={{marginRight:6}}/>Guardar cambios
                </button>
              </div>
            </div>
          )}

          {tab === "seguridad" && (
            <div className="config-section">
              <h3 className="config-section-title">Seguridad</h3>
              <div className="security-item">
                <div>
                  <p className="security-item-label">Autenticación de dos factores</p>
                  <p className="security-item-sub">Agrega una capa extra de seguridad</p>
                </div>
                <Toggle on={config.seguridad.twofa} onChange={setToggle("seguridad","twofa")}/>
              </div>
              <div className="security-item">
                <div>
                  <p className="security-item-label">Registro de inicios de sesión</p>
                  <p className="security-item-sub">Guarda historial de accesos</p>
                </div>
                <Toggle on={config.seguridad.loginLog} onChange={setToggle("seguridad","loginLog")}/>
              </div>
              <div className="field">
                <label>Tiempo de sesión (minutos)</label>
                <input type="number" min="15" max="480" value={config.seguridad.sessionTimeout}
                  onChange={set("seguridad","sessionTimeout")} style={{maxWidth:160}}/>
              </div>

              <div className="danger-zone">
                <h4><AlertTriangle size={14} style={{display:"inline",marginRight:6}}/>Zona de peligro</h4>
                <p>Estas acciones son permanentes e irreversibles.</p>
                <button className="btn-danger-outline"><Trash2 size={13}/>Eliminar todos los datos</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
