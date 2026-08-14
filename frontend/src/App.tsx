import { useCallback, useEffect, useState } from "react";
import "./App.css";
import type { Campaign, Page, User } from "./types";
import { loginDemoUser } from "./api/users";
import { fetchCampaigns } from "./api/campaigns";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Campaigns from "./pages/Campaigns";
import CampaignDetail from "./pages/CampaignDetail";
import CreateCampaign from "./pages/CreateCampaign";
import Analytics from "./pages/Analytics";

const USER_STORAGE_KEY = "queuelet_user";
const PAGE_SUBTITLES: Record<Page, string> = {
  Dashboard: "Here's what's happening with your campaigns.",
  Campaigns: "Manage and monitor your email campaigns.",
  Create: "Create and schedule a new email campaign.",
  Analytics: "Track your email outreach performance.",
  Detail: "Campaign details.",
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [page, setPage] = useState<Page>("Dashboard");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [campaignsError, setCampaignsError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem(USER_STORAGE_KEY); }
    }
  }, []);

  const loadCampaigns = useCallback((userId: string) => {
    setCampaignsLoading(true);
    setCampaignsError(null);
    fetchCampaigns(userId)
      .then(setCampaigns)
      .catch(() => setCampaignsError("Failed to load campaigns from the server."))
      .finally(() => setCampaignsLoading(false));
  }, []);

  useEffect(() => { if (user) loadCampaigns(user.id); }, [user, loadCampaigns]);

  const handleLogin = async (name: string, email: string) => {
    setLoginLoading(true); setLoginError(null);
    try {
      const loggedInUser = await loginDemoUser(name, email);
      setUser(loggedInUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
    } catch (err) {
      console.error(err);
      setLoginError("Couldn't reach the Queuelet API. Check the deployed backend URL.");
    } finally { setLoginLoading(false); }
  };

  const handleLogout = () => {
    setUser(null); setCampaigns([]); localStorage.removeItem(USER_STORAGE_KEY);
    setPage("Dashboard"); setSelectedCampaignId(null);
  };
  const goToDetail = (id: string) => { setSelectedCampaignId(id); setPage("Detail"); };
  const backToCampaigns = () => { setSelectedCampaignId(null); setPage("Campaigns"); if (user) loadCampaigns(user.id); };

  if (!user) return <Login onLogin={handleLogin} loading={loginLoading} error={loginError} />;
  const title = page === "Detail" ? "Campaign" : page;

  return (
    <div className="app">
      <Sidebar page={page === "Detail" ? "Campaigns" : page} onNavigate={setPage} onLogout={handleLogout} />
      <main className="main">
        <Topbar title={title} subtitle={PAGE_SUBTITLES[page]} user={user} />
        {campaignsError && <p style={{ color: "#d64545", marginBottom: 20 }}>{campaignsError}</p>}
        {campaignsLoading && page !== "Detail" ? <p style={{ color: "#8991a1" }}>Loading campaigns…</p> : <>
          {page === "Dashboard" && <Dashboard campaigns={campaigns} onNavigate={setPage} />}
          {page === "Campaigns" && <Campaigns campaigns={campaigns} onView={goToDetail} />}
          {page === "Detail" && selectedCampaignId && <CampaignDetail campaignId={selectedCampaignId} onBack={backToCampaigns} onDeleted={backToCampaigns} />}
          {page === "Create" && <CreateCampaign userId={user.id} onNavigate={setPage} onCreated={() => loadCampaigns(user.id)} />}
          {page === "Analytics" && <Analytics campaigns={campaigns} />}
        </>}
      </main>
    </div>
  );
}
export default App;
