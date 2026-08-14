import type { Page } from "../types";

interface SidebarProps {
  page: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const NAV_ITEMS: { page: Page; icon: string; label: string }[] = [
  { page: "Dashboard", icon: "⌂", label: "Dashboard" },
  { page: "Campaigns", icon: "✉", label: "Campaigns" },
  { page: "Create", icon: "＋", label: "Create Campaign" },
  { page: "Analytics", icon: "◈", label: "Analytics" },
];

function Sidebar({ page, onNavigate, onLogout }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="logo">Q</div>
        <span>Queuelet</span>
      </div>

      <div className="nav-section">
        <p className="nav-title">MAIN</p>

        {NAV_ITEMS.map((item) => (
          <button
            key={item.page}
            className={page === item.page ? "nav active" : "nav"}
            onClick={() => onNavigate(item.page)}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      <div className="nav-section bottom-nav">
        <button className="nav">
          <span>⚙</span>
          Settings
        </button>

        <button className="nav" onClick={onLogout}>
          <span>↪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
