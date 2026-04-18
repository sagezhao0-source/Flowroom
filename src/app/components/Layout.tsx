import { Outlet, Link, useLocation } from "react-router";
import { Home, CheckSquare, BarChart3 } from "lucide-react";
import { TaskProvider } from "../context/TaskContext";

export function Layout() {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Room" },
    { path: "/tasks", icon: CheckSquare, label: "Collection" },
    { path: "/stats", icon: BarChart3, label: "Stats" },
  ];

  return (
    <TaskProvider>
      <div className="h-screen flex flex-col bg-background">
        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        {/* Bottom navigation */}
        <nav className="bg-white/60 backdrop-blur-lg border-t border-border">
          <div className="max-w-2xl mx-auto px-6 py-4">
            <div className="flex items-center justify-around gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== "/" && location.pathname.startsWith(item.path));

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </TaskProvider>
  );
}
