import { useEffect, useState } from "react";
import { useStore } from "./lib/store";
import Toast from "./components/Toast";
import AuthPage from "./routes/AuthPage";
import LinkPage from "./routes/LinkPage";
import DashboardPage from "./routes/DashboardPage";
import CalendarPage from "./routes/CalendarPage";
import JournalPage from "./routes/JournalPage";
import NotesPage from "./routes/NotesPage";
import ThoughtsPage from "./routes/ThoughtsPage";
import SharingPage from "./routes/SharingPage";
import SettingsPage from "./routes/SettingsPage";

const NAV = [
  { id: "dashboard", label: "Dashboard" },
  { id: "calendar", label: "Cycle" },
  { id: "journal", label: "Writing" },
  { id: "thoughts", label: "Thinking of you" },
  { id: "notes", label: "Notes" },
  { id: "sharing", label: "Sharing" },
  { id: "link", label: "Link" },
  { id: "settings", label: "Comfort" },
  { id: "auth", label: "Account" },
];

const PAGES = {
  auth: AuthPage,
  link: LinkPage,
  dashboard: DashboardPage,
  calendar: CalendarPage,
  journal: JournalPage,
  notes: NotesPage,
  thoughts: ThoughtsPage,
  sharing: SharingPage,
  settings: SettingsPage,
};

export default function App() {
  const { state } = useStore();
  const [route, setRoute] = useState(state.auth.user ? "dashboard" : "auth");

  // Comfort: theme, text size, ruled lines applied to the document root.
  useEffect(() => {
    const c = state.comfort;
    if (c.theme === "auto") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", c.theme);
    document.body.classList.toggle("text-large", c.textSize === "large");
  }, [state.comfort]);

  const goTo = (id) => setRoute(id);
  const Page = PAGES[route] || DashboardPage;
  const appClass = "app" + (state.comfort.ruledLines ? " ruled" : "");

  return (
    <div className={appClass}>
      <nav className="topnav" aria-label="Sections">
        <span className="brand">Daily Journal</span>
        {NAV.map((n) => (
          <button key={n.id} aria-current={route === n.id} onClick={() => goTo(n.id)}>
            {n.label}
          </button>
        ))}
      </nav>
      <Page goTo={goTo} />
      <Toast />
    </div>
  );
}
