"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  CalendarCheck,
  Database,
  FileText,
  Home,
  Lightbulb,
  Settings,
  Users,
  Video
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "工作台", icon: Home },
  { href: "/clients", label: "客户", icon: Users },
  { href: "/agents", label: "智能体", icon: Bot },
  { href: "/records", label: "生成记录", icon: FileText },
  { href: "/followups", label: "跟进", icon: CalendarCheck },
  { href: "/content", label: "内容创作", icon: Video },
  { href: "/knowledge", label: "知识库", icon: Database },
  { href: "/settings", label: "设置", icon: Settings }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 z-20 border-b border-slate-800 bg-ink text-white lg:h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-3 px-4 py-4 lg:px-6 lg:py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-wine text-gold">
          <Lightbulb size={22} />
        </div>
        <div>
          <div className="text-base font-bold">个人智能体工作台</div>
          <div className="text-xs text-slate-400">本地优先 · 自用 MVP</div>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:overflow-visible lg:px-4">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                active ? "bg-wine text-white" : "text-slate-300 hover:bg-white/8 hover:text-white"
              }`}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
