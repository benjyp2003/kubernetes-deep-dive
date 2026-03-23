import {
  Home, BookOpen, Server, Box, Layers, Network, HardDrive,
  Shield, Target, Tag, Settings, FolderTree, FileCode,
  Globe, Puzzle, AlertTriangle, BookA, Workflow, HelpCircle, FlaskConical, Gamepad2, Bug, Hammer
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const sections = [
  {
    label: "Getting Started",
    items: [
      { title: "Home", url: "/", icon: Home },
      { title: "Start Here", url: "/start", icon: BookOpen },
      { title: "Foundations", url: "/foundations", icon: BookA },
    ],
  },
  {
    label: "Core Concepts",
    items: [
      { title: "Architecture", url: "/architecture", icon: Server },
      { title: "Objects", url: "/objects", icon: Box },
      { title: "Workloads", url: "/workloads", icon: Layers },
      { title: "YAML", url: "/yaml", icon: FileCode },
    ],
  },
  {
    label: "Deep Dives",
    items: [
      { title: "Networking", url: "/networking", icon: Network },
      { title: "Services & DNS", url: "/services", icon: Globe },
      { title: "Storage", url: "/storage", icon: HardDrive },
      { title: "Security", url: "/security", icon: Shield },
      { title: "Scheduling", url: "/scheduling", icon: Target },
    ],
  },
  {
    label: "Advanced",
    items: [
      { title: "Labels & Selectors", url: "/labels", icon: Tag },
      { title: "Config & Namespaces", url: "/config", icon: FolderTree },
      { title: "CRDs & Operators", url: "/operators", icon: Puzzle },
      { title: "OpenShift", url: "/openshift", icon: Settings },
    ],
  },
  {
    label: "Practice",
    items: [
      { title: "Troubleshooting", url: "/troubleshooting", icon: AlertTriangle },
      { title: "Troubleshooting Lab", url: "/troubleshooting-lab", icon: Bug },
      { title: "Interactive Flows", url: "/flows", icon: Workflow },
      { title: "Visual Lab", url: "/visual-lab", icon: FlaskConical },
      { title: "3D Simulator", url: "/simulator", icon: Gamepad2 },
      { title: "Cluster Builder", url: "/cluster-builder", icon: Hammer },
      { title: "Glossary", url: "/glossary", icon: HelpCircle },
    ],
  },
];

const AppSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="bg-sidebar pt-2">
        {!collapsed && (
          <div className="px-4 py-3 mb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">K8</span>
              </div>
              <div>
                <p className="font-display font-bold text-sm text-sidebar-accent-foreground">Kubernetes</p>
                <p className="text-xs text-sidebar-foreground/60">Deep Dive</p>
              </div>
            </div>
          </div>
        )}
        {sections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel className="text-sidebar-foreground/40 text-xs uppercase tracking-wider">
              {!collapsed && section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className="text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
