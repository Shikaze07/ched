"use client"

import * as React from "react"
import {
  IconBook2,
  IconCamera,
  IconChartBar,
  IconChecklist,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconGavel,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconReportAnalytics,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"
import Image from "next/image"
import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "ched",
    email: "ched@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: IconDashboard,
    },

    {
      title: "Institution",
      url: "/admin/institution",
      icon: IconChecklist,
    },
    {
      title: "Program",
      url: "/admin/program",
      icon: IconBook2,
    },
    {
      title: "CMO",
      url: "/admin/cmo",
      icon: IconGavel,
    },
    {
      title: "Evaluations",
      url: "/admin/evaluation",
      icon: IconChecklist,
      items: [
        {
          title: "Evaluations",
          url: "/admin/evaluation",
        },
        {
          title: "Archived Evaluations",
          url: "/admin/evaluation/archived",
        },
      ],
    },
    {
      title: "Evaluation Checklist",
      url: "/admin/evaluation-checklist/list",
      icon: IconChecklist,
      isActive: true,
      items: [
        {
          title: "Template List",
          url: "/admin/evaluation-checklist/list",
        },
        // {
        //   title: "Template Builder",
        //   url: "/admin/evaluation-checklist/builder",
        // },
      ],
    },


    {
      title: "Reports",
      url: "/admin/report",
      icon: IconReportAnalytics,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3">
              <div className="flex h-20 w-20 items-center justify-center rounded-md text-sm font-semibold">
                <Image src="/ched-logo.png" alt="CHED Logo" width={50} height={50} />
              </div>

              <div className="leading-tight">
                <h1 className="text-sm font-medium">
                  COMMISSION ON HIGHER EDUCATION - REGIONAL OFFICE XIII
                </h1>

              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
