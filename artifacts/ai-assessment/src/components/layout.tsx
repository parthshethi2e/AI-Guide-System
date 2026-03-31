import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { BrainCircuit, LayoutDashboard, List, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Overview", icon: BrainCircuit },
    { href: "/dashboard", label: "Analytics", icon: LayoutDashboard },
    { href: "/assessments", label: "Assessments", icon: List },
  ];

  return (
    <div className="min-h-[100dvh] flex bg-gray-50/50">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col fixed inset-y-0 left-0 border-r border-sidebar-border z-20">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border/50">
          <BrainCircuit className="w-6 h-6 mr-3 text-sidebar-primary" />
          <span className="font-semibold tracking-tight text-lg">AI Maturity</span>
        </div>
        <div className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className="block">
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${
                    isActive 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t border-sidebar-border/50">
          <Link href="/start" className="block">
            <Button className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground border-0 shadow-sm">
              New Assessment
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-w-0 flex flex-col">
        <header className="h-16 bg-white border-b border-border/60 flex items-center px-8 sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/80">
          <h1 className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
            {navItems.find(n => n.href === location)?.label || "Assessment"}
          </h1>
        </header>
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
