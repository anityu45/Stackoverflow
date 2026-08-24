import { cn } from "@/lib/utils";
import {
  Bookmark,
  Bot,
  Building,
  FileText,
  Home,
  MessageSquare,
  MessageSquareIcon,
  Tag,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { Badge } from "./ui/badge";

const Sidebar = ({ isopen }: any) => {
  const router = useRouter();

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Questions", href: "/questions", icon: MessageSquareIcon },
    { label: "AI Assist", href: "/ask", icon: Bot, badge: "Labs" },
    { label: "Tags", href: "/tags", icon: Tag },
    { label: "Users", href: "/users", icon: Users },
  ];

  return (
    <aside
      className={cn(
        "top-[53px] w-52 lg:w-64 min-h-screen bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out md:translate-x-0",
        isopen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <nav className="p-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? router.pathname === "/"
                : router.pathname.startsWith(item.href);

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-xs lg:text-sm font-medium transition",
                    isActive
                      ? "bg-orange-50 text-orange-600 font-semibold border-r-4 border-orange-500 rounded-r-none"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className={cn("w-4 h-4 mr-2.5", isActive ? "text-orange-500" : "text-gray-500")} />
                  {item.label}
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto text-[10px] bg-orange-100 text-orange-700">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </li>
            );
          })}

          <li className="pt-4 pb-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3">
            Explore
          </li>

          <li>
            <Link
              href="/questions"
              className="flex items-center px-3 py-2 text-xs lg:text-sm text-gray-600 hover:bg-gray-100 rounded-md transition"
            >
              <Bookmark className="w-4 h-4 mr-2.5 text-gray-400" />
              Saves & Bookmarks
            </Link>
          </li>
          <li>
            <Link
              href="/questions"
              className="flex items-center px-3 py-2 text-xs lg:text-sm text-gray-600 hover:bg-gray-100 rounded-md transition"
            >
              <Trophy className="w-4 h-4 mr-2.5 text-gray-400" />
              Challenges
              <Badge variant="secondary" className="ml-auto text-[10px] bg-emerald-100 text-emerald-800">
                NEW
              </Badge>
            </Link>
          </li>
          <li>
            <Link
              href="/questions"
              className="flex items-center px-3 py-2 text-xs lg:text-sm text-gray-600 hover:bg-gray-100 rounded-md transition"
            >
              <MessageSquare className="w-4 h-4 mr-2.5 text-gray-400" />
              Discussions
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
