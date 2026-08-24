import { useAuth } from "@/lib/AuthContext";
import { Menu, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const Navbar = ({ handleslidein }: any) => {
  const { user, Logout } = useAuth();
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/questions?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/questions");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full min-h-[53px] bg-white border-t-[3px] border-[#ef8236] shadow-sm flex items-center justify-center">
      <div className="w-[92%] max-w-[1440px] flex items-center justify-between mx-auto py-1.5 gap-4">
        <button
          aria-label="Toggle sidebar"
          className="md:hidden p-2 rounded hover:bg-gray-100 transition"
          onClick={handleslidein}
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>

        <div className="flex items-center gap-3 flex-grow">
          <Link href="/" className="flex items-center gap-1.5 font-bold text-gray-800 text-lg">
            <img src="/logo.png" alt="Stack Overflow Logo" className="h-6 w-auto" />
          </Link>

          <div className="hidden md:flex gap-1 items-center">
            <Link
              href="/"
              className="text-xs text-gray-600 font-medium px-3 py-1.5 rounded-full hover:bg-gray-100 transition"
            >
              About
            </Link>
            <Link
              href="/questions"
              className="text-xs text-gray-600 font-medium px-3 py-1.5 rounded-full hover:bg-gray-100 transition"
            >
              Products
            </Link>
          </div>

          <form onSubmit={handleSearch} className="hidden sm:block flex-grow relative max-w-[600px] mx-2">
            <input
              type="text"
              placeholder="Search title, description, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs lg:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400/50 bg-gray-50/50 focus:bg-white transition"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </form>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {!hasMounted ? null : !user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/auth"
                className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3.5 py-1.5 rounded transition"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded transition shadow-sm"
              >
                Sign up
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href={`/users/${user._id}`}
                className="flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold w-8 h-8 rounded-full shadow-sm transition"
                title={user.name}
              >
                {user.name?.charAt(0).toUpperCase() || "U"}
              </Link>

              <button
                onClick={Logout}
                className="text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-3 py-1.5 rounded transition"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
