import { useState, useEffect } from "react";
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
import { Video, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StreamData {
  id: number;
  name: string;
  url: string;
}

interface VideoAnalyticsSidebarProps {
  streams: StreamData[];
  selectedView: string;
  onViewChange: (view: string) => void;
  objectCounts: Record<string, Record<string, number>>;
}

export function VideoAnalyticsSidebar({ 
  streams, 
  selectedView, 
  onViewChange, 
  objectCounts 
}: VideoAnalyticsSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const menuItems = [
    {
      id: "overall",
      title: "Overall",
      icon: BarChart3,
      count: Object.values(objectCounts.overall || {}).reduce((sum, count) => sum + count, 0)
    },
    ...streams.map((stream, index) => ({
      id: `source${stream.id}`,
      title: `Source ${stream.id}`,
      icon: Video,
      count: Object.values(objectCounts[`source${stream.id}`] || {}).reduce((sum, count) => sum + count, 0)
    }))
  ];

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-60"}
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Analytics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    asChild
                    className={selectedView === item.id ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                  >
                    <button 
                      onClick={() => onViewChange(item.id)}
                      className="flex items-center justify-between w-full"
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className="w-4 h-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </div>
                      {!collapsed && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.count}
                        </Badge>
                      )}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}