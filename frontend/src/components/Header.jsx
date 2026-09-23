import { useLocation, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, Settings, User, LogOut, Search, Sun, Moon, X, Menu } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useNotifs } from "../context/NotifContext";
import { useAuth } from "../context/AuthContext";
import "./Header.css";

const PAGE_TITLES = {
  "/dashboard":"Dashboard", "/pedidos":"Pedidos", "/productos":"Productos",
  "/clientes":"Clientes", "/rutas":"Rutas", "/pagos":"Pagos",
  "/informes":"Informes", "/configuracion":"Configuración",
};

const SEARCH_DATA = [
  { icon:"🛒", label:"Pedidos",   sub:"Ver todos los pedidos",   route:"/pedidos" },
  { icon:"📦", label:"Productos", sub:"Catálogo de productos",   route:"/productos" },
  { icon:"👥", label:"Clientes",  sub:"Gestión de clientes",     route:"/clientes" },
  { icon:"🗺️", label:"Rutas",    sub:"Rutas de entrega",        route:"/rutas" },
  { icon:"💳", label:"Pagos",     sub:"Historial de pagos",      route:"/pagos" },
  { icon:"📊", label:"Informes",  sub:"Reportes y estadísticas", route:"/informes" },
];

export default function Header({ onMenuToggle }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isDark, toggle: toggleTheme } = useTheme();
  const { notifs, marcarLeido, marcarTodos, eliminar, unread } = useNotifs();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen]     = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen]   = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef(null);
  const title = PAGE_TITLES[pathname] || "Dashboard";

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const handler = e => {
      if (!e.target.closest(".search-panel") && !e.target.closest(".icon-btn-search"))
        setSearchOpen(false);
      if (!e.target.closest(".notif-panel") && !e.target.closest(".icon-btn-notif"))
        setNotifOpen(false);
      if (!e.target.closest(".user-menu"))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredSearch = SEARCH_DATA.filter(d =>
    query === "" || d.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <header className="header">
        <button className="icon-btn menu-btn" onClick={onMenuToggle} aria-label="Abrir menú">
          <Menu size={19}/>
        </button>
        <div className="header-left">
          <div className="header-breadcrumb">
            <span>Maquilishuat</span>
            <span>›</span>
            <span>{title}</span>
          </div>
          <h1 className="header-title">{title}</h1>
        </div>

        <div className="header-right">
          <button className={`icon-btn icon-btn-search ${searchOpen?"active":""}`}
            onClick={() => { setSearchOpen(o=>!o); setNotifOpen(false); }}>
            <Search size={17}/>
          </button>

          <button className="icon-btn" onClick={toggleTheme} title={isDark?"Modo claro":"Modo oscuro"}>
            {isDark ? <Sun size={17}/> : <Moon size={17}/>}
          </button>

          <button className={`icon-btn icon-btn-notif ${notifOpen?"active":""}`}
            onClick={() => { setNotifOpen(o=>!o); setSearchOpen(false); }}>
            <Bell size={17}/>
            {unread > 0 && <span className="notif-badge">{unread}</span>}
          </button>

          <div className="user-menu" onClick={() => setMenuOpen(o=>!o)}>
            <div className="user-avatar">AU</div>
            <div className="user-info">
              <span className="user-name">Admin</span>
              <span className="user-role">Administrador</span>
            </div>
            <ChevronDown size={13} className={`chevron ${menuOpen?"open":""}`}/>
            {menuOpen && (
              <div className="dropdown" onClick={e=>e.stopPropagation()}>
                <button className="dropdown-item" onClick={()=>{setMenuOpen(false);navigate("/configuracion");}}>
                  <Settings size={14}/> Configuración
                </button>
                <button className="dropdown-item">
                  <User size={14}/> Mi perfil
                </button>
                <hr/>
                <button className="dropdown-item logout" onClick={async ()=>{ setMenuOpen(false); await logout(); navigate("/login"); }}>
                  <LogOut size={14}/> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {searchOpen && (
        <div className="search-panel">
          <div className="search-panel-inner">
            <Search size={16} style={{color:"var(--text-muted)",flexShrink:0}}/>
            <input ref={searchRef} className="search-panel-input"
              placeholder="Pedidos, clientes, rutas…"
              value={query} onChange={e=>setQuery(e.target.value)}/>
            {query && <button onClick={()=>setQuery("")} style={{background:"none",border:"none",color:"var(--text-muted)",display:"flex"}}><X size={14}/></button>}
          </div>
          <div className="search-results">
            {filteredSearch.map(d => (
              <div key={d.route} className="search-result-item"
                onClick={()=>{navigate(d.route);setSearchOpen(false);setQuery("");}}>
                <div className="sr-icon">{d.icon}</div>
                <div className="sr-text">
                  <p>{d.label}</p>
                  <span>{d.sub}</span>
                </div>
              </div>
            ))}
            {filteredSearch.length === 0 && (
              <p style={{color:"var(--text-muted)",fontSize:13,padding:"10px 14px"}}>Sin resultados para "{query}"</p>
            )}
          </div>
        </div>
      )}

      {notifOpen && (
        <div className="notif-panel">
          <div className="notif-header">
            <h3>Notificaciones {unread>0 && <span style={{color:"var(--brand-500)",fontWeight:700}}>({unread})</span>}</h3>
            {unread>0 && <button className="notif-mark-all" onClick={marcarTodos}>Marcar todas</button>}
          </div>
          <div className="notif-list">
            {notifs.length === 0
              ? <p className="notif-empty">No hay notificaciones.</p>
              : notifs.map(n => (
                <div key={n.id} className={`notif-item ${!n.leido?"unread":""}`}
                  onClick={()=>marcarLeido(n.id)}>
                  <div className="notif-icon-wrap">{n.icon}</div>
                  <div className="notif-body">
                    <p className="notif-title">{n.titulo}</p>
                    <p className="notif-desc">{n.desc}</p>
                    <p className="notif-time">{n.tiempo}</p>
                  </div>
                  {!n.leido && <div className="notif-unread-dot"/>}
                  <button className="notif-delete" onClick={e=>{e.stopPropagation();eliminar(n.id);}}>✕</button>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </>
  );
}
