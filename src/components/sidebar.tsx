import {
  Building2,
  ChevronRight,
  FileText,
  Folders,
  Home,
  Scale,
  Settings2,
  SquareTerminal,
  UserRoundCheck,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useGetCurrentUser } from "@/gen/endpoints/fastAPI";
import { Link, useLocation } from "@tanstack/react-router";
import { NavUser } from "./nav-user";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

const data = {
  navMain: [
    {
      title: "Menu Principal",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Accueil",
          url: "/",
          icon: Home,
        },
        {
          title: "Dossiers",
          url: "/cases",
          icon: Folders,
        },
        {
          title: "Clients",
          url: "/clients",
          icon: Users,
        },
      ],
    },

    {
      title: "Paramètres du Système",
      url: "/settings",
      icon: Settings2,
      items: [
        {
          title: "Types de Dossiers",
          url: "/settings/case-types",
          icon: FileText,
        },
        {
          title: "Tribunaux",
          url: "/settings/courts",
          icon: Building2,
        },
        {
          title: "Juges",
          url: "/settings/judges",
          icon: UserRoundCheck,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: userData } = useGetCurrentUser();
  const { pathname } = useLocation();
  const user = userData?.data;

  const isActiveItem = (item: { url: string; items?: { url: string }[] }) =>
    item.items?.some((subItem) => pathname.startsWith(subItem.url));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div>
                <div className="flex aspect-square size-8 items-center justify-center bg-primary text-primary-foreground">
                  <Scale className="size-6" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-xl">
                    Chasse au tresor
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Plateforme</SidebarGroupLabel>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <Collapsible
                key={item.title}
                asChild
                className="group/collapsible"
                defaultOpen={isActiveItem(item)}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link to={subItem.url}>
                              <subItem.icon />
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
