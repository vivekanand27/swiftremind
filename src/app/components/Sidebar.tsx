"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { HiOutlineHome, HiOutlineUserGroup, HiOutlineUser, HiOutlineBell, HiOutlineClipboard, HiOutlineCog, HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { useUser } from "@/hooks/UserContext";
import axios from "axios";
import { useRouter } from "next/navigation";

interface SidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

const Sidebar = ({ onCollapseChange }: SidebarProps) => {
  const pathname = usePathname();
  const { user, loading, setUser } = useUser();
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  const handleCollapseChange = (newCollapsed: boolean) => {
    setCollapsed(newCollapsed);
    onCollapseChange?.(newCollapsed);
  };

  // Build navigation links based on user role and loading state
  const getNavLinks = () => {
    const baseLinks = [
      { href: "/dashboard", label: "Dashboard", icon: <HiOutlineHome size={22} /> },
      { href: "/customers", label: "Customers", icon: <HiOutlineUserGroup size={22} /> },
      { href: "/users", label: "Users", icon: <HiOutlineUser size={22} /> },
    ];
    // Show Reminders and Notifications for superadmin and admin
    if (!loading && (user?.role === "superadmin" || user?.role === "admin")) {
      baseLinks.push(
        { href: "/reminders", label: "Reminders", icon: <HiOutlineClipboard size={22} /> },
        { href: "/notifications", label: "Notifications", icon: <HiOutlineBell size={22} /> }
      );
    }
    // Only show organizations link if user is loaded and is superadmin
    if (!loading && user?.role === "superadmin") {
      baseLinks.push({ 
        href: "/organisations", 
        label: "Organisations", 
        icon: <HiOutlineBuildingOffice2 size={22} /> 
      });
    }
    baseLinks.push({ href: "/profile", label: "Profile", icon: <HiOutlineCog size={22} /> });
    return baseLinks;
  };

  const navLinks = getNavLinks();

  const handleLogout = async () => {
    try {
      await axios.post('/api/users/logout', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (e) {
      // Ignore errors, always clear token
    } finally {
      localStorage.removeItem('token');
      setUser && setUser(null); // If setUser is available from context
      router.push('/login'); // Redirect to login page
    }
  };

  return (
    <aside className={`h-screen bg-white shadow-lg flex flex-col py-6 px-2 fixed top-0 left-0 z-40 transition-all duration-200 ${collapsed ? 'w-16' : 'w-60'}`}>
      <div className={`mb-4 flex items-center ${collapsed ? 'px-0 justify-center' : 'px-2'}`}>
        <span className={`text-2xl font-bold text-blue-700 transition-all duration-200 ${collapsed ? 'text-center w-full' : ''}`}>{collapsed ? '' : 'SwiftRemind'}</span>
        <button
          onClick={() => handleCollapseChange(!collapsed)}
          className="ml-auto bg-white text-blue-600 border border-blue-100 shadow p-2 rounded-full hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <HiOutlineChevronRight size={28} /> : <HiOutlineChevronLeft size={28} />}
        </button>
      </div>
      <nav className="flex flex-col gap-2 mt-4 flex-1">
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-2 py-2 rounded font-semibold transition-colors ${pathname.startsWith(link.href) ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"} ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? link.label : undefined}
          >
            <span>{link.icon}</span>
            {!collapsed && <span>{link.label}</span>}
          </Link>
        ))}
      </nav>
      <div className="mt-auto flex flex-col items-center gap-2 pb-2">
        {!collapsed && user && (
          <div className="text-xs text-gray-500 mb-1 text-center max-w-[120px] truncate">
            {user.name || user.email || user.phone || "User"}
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors shadow"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 12H9m0 0l3-3m-3 3l3 3" />
          </svg>
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar; 