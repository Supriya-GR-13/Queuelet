import type { User } from "../types";

interface TopbarProps {
  title: string;
  subtitle: string;
  user: User;
}

function Topbar({ title, subtitle, user }: TopbarProps) {
  const initial = user.name?.charAt(0).toUpperCase() || "U";

  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="user">
        <div className="avatar">{initial}</div>
        <div>
          <strong>{user.name}</strong>
          <small>{user.email}</small>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
