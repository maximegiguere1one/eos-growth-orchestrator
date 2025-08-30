import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Video, 
  Target, 
  Calendar,
  Settings,
  BarChart3,
  CheckSquare,
  Building2
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Cockpit",
    url: "/",
    icon: LayoutDashboard,
    description: "Vue d'ensemble"
  },
  {
    title: "Clients",
    url: "/clients",
    icon: Users,
    description: "Gestion clients"
  },
  {
    title: "Vidéos",
    url: "/videos",
    icon: Video,
    description: "Production vidéos"
  },
  {
    title: "Publicités",
    url: "/ads",
    icon: Target,
    description: "Campagnes publicitaires"
  }
];

const eosItems = [
  {
    title: "EOS Dashboard",
    url: "/eos",
    icon: Building2,
    description: "Vue EOS globale"
  },
  {
    title: "Level 10 Meetings",
    url: "/eos/meetings",
    icon: Calendar,
    description: "Réunions hebdo"
  },
  {
    title: "Scorecard",
    url: "/eos/scorecard",
    icon: BarChart3,
    description: "Métriques EOS"
  },
  {
    title: "Issues & Rocks",
    url: "/eos/issues",
    icon: CheckSquare,
    description: "Issues et rocks"
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const getNavClass = (path: string) => {
    return isActive(path) 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "hover:bg-sidebar-accent/50 text-sidebar-foreground";
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClass(item.url)}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* EOS Model Section */}
        <SidebarGroup>
          <SidebarGroupLabel>EOS Model</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {eosItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClass(item.url)}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/settings" className={getNavClass("/settings")}>
                    <Settings className="h-4 w-4" />
                    <span>Paramètres</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}