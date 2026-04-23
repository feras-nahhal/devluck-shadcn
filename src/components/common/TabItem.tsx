"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

export type TabItem = {
  name: string;
  value: string;
  icon?: LucideIcon;
  content: ReactNode;
};

type IconTabsProps = {
  tabs: TabItem[];
  defaultValue?: string;
  className?: string;
};

export function IconTabs({
  tabs,
  defaultValue,
  className,
}: IconTabsProps) {
  return (
    <Tabs defaultValue={defaultValue || tabs[0]?.value} className={className}>
      {/* TAB HEADERS */}

{/* 📱 MOBILE TABS */}
<TabsList
  className="
    flex md:hidden
    w-full
    items-center
    justify-start
    overflow-x-auto no-scrollbar
    gap-2 p-1 bg-muted/40 rounded-xl
  "
>
  {tabs.map(({ icon: Icon, name, value }) => (
    <TabsTrigger
      key={value}
      value={value}
      className="
        flex items-center gap-2
        px-4 py-2
        whitespace-nowrap flex-shrink-0
      "
    >
      {Icon && <Icon className="h-4 w-4" />}
      {name}
    </TabsTrigger>
  ))}
</TabsList>
        {/* 💻 DESKTOP TABS (your original) */}
        <TabsList className="hidden justify-start md:flex gap-2 w-fit ">
        {tabs.map(({ icon: Icon, name, value }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="flex items-center gap-2"
          >
            {Icon && <Icon className="h-4 w-4" />}
            {name}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* TAB CONTENT */}
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="mt-6"  >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}