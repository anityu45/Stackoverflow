import React, { useState, useEffect } from "react";
import Head from "next/head";
import { toast } from "react-toastify";
import { Sparkles, TrendingUp, Users, Rss, Hash, Search, RefreshCw } from "lucide-react";
import Navbar from "../../components/Navbar";
import SideBar from "../../components/SideBar";
import { PostComposer } from "../../components/Feed/PostComposer";
import { PostCard } from "../../components/Feed/PostCard";
import axiosInstance from "../../lib/axiosinstance";
import { Post } from "../../types/feed";

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<"all" | "following" | "trending">("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [popularTags, setPopularTags] = useState<string[]>([
    "react",
    "javascript",
    "nextjs",
    "typescript",
    "python",
    "webdev",
    "backend",
  ]);

  const fetchFeed = async (resetPage = false) => {
    const targetPage = resetPage ? 1 : page;
    if (resetPage) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params: any = {
        page: targetPage,
        limit: 8,
        filter,
      };
      if (selectedTag) params.tag = selectedTag;

      const res = await axiosInstance.get("/post/feed", { params });
      const fetchedPosts: Post[] = res.data?.data || [];
      const pagination = res.data?.meta || {};

      if (resetPage) {
        setPosts(fetchedPosts);
      } else {
        setPosts((prev) => [...prev, ...fetchedPosts]);
      }
      setTotalPages(pagination.pages || 1);

      // Collect trending hashtags dynamically
      const tagsSet = new Set<string>(popularTags);
      fetchedPosts.forEach((p) => p.tags?.forEach((t) => tagsSet.add(t)));
      setPopularTags(Array.from(tagsSet).slice(0, 10));
    } catch (err: any) {
      toast.error("Failed to load community feed");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchFeed(true);
  }, [filter, selectedTag]);

  const handleLoadMore = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (page > 1) {
      fetchFeed(false);
    }
  }, [page]);

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  const filteredPosts = searchQuery.trim()
    ? posts.filter(
        (p) =>
          p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
          p.user?.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : posts;

  return (
    <>
      <Head>
        <title>Community Feed - StackOverflow Clone</title>
        <meta name="description" content="Discover technical updates, code snippets, project showcases and achievements." />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />

        <div className="flex-1 max-w-7xl w-full mx-auto flex gap-6 px-4 py-6">
          {/* Left Sidebar */}
          <div className="hidden lg:block w-60 shrink-0">
            <SideBar />
          </div>

          {/* Main Feed Container */}
          <main className="flex-1 max-w-2xl">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Community Feed</h1>
              <p className="text-xs text-gray-500 mt-1">
                Explore technical updates, code snippets, project showcases, and developer achievements.
              </p>
            </div>

            {/* Post Composer Component */}
            <PostComposer onPostCreated={handlePostCreated} />

            {/* Feed Filter Tabs & Search */}
            <div className="bg-white border border-gray-200 rounded-xl p-3 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 text-xs font-semibold">
                <button
                  onClick={() => {
                    setFilter("all");
                    setSelectedTag(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                    filter === "all" && !selectedTag
                      ? "bg-orange-500 text-white shadow-xs"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Rss className="w-3.5 h-3.5" /> All Feed
                </button>

                <button
                  onClick={() => {
                    setFilter("following");
                    setSelectedTag(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                    filter === "following"
                      ? "bg-orange-500 text-white shadow-xs"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" /> Following
                </button>

                <button
                  onClick={() => {
                    setFilter("trending");
                    setSelectedTag(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                    filter === "trending"
                      ? "bg-orange-500 text-white shadow-xs"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" /> Trending
                </button>
              </div>

              {/* Search Box */}
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search feed..."
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Active Tag Banner */}
            {selectedTag && (
              <div className="bg-orange-50 border border-orange-200 text-orange-800 text-xs px-3 py-2 rounded-lg mb-4 flex items-center justify-between">
                <span>
                  Filtering by hashtag: <strong>#{selectedTag}</strong>
                </span>
                <button onClick={() => setSelectedTag(null)} className="hover:underline font-semibold text-xs">
                  Clear filter
                </button>
              </div>
            )}

            {/* Feed Items */}
            {loading ? (
              <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
                <RefreshCw className="w-6 h-6 animate-spin text-orange-500 mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-medium">Loading Community Feed...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                <Sparkles className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 text-sm">No feed posts found</h3>
                <p className="text-xs text-gray-500 mt-1">Be the first developer to publish an update or code snippet!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onPostDeleted={handlePostDeleted}
                    onTagClick={(tag) => setSelectedTag(tag)}
                  />
                ))}

                {/* Pagination / Load More */}
                {page < totalPages && (
                  <div className="text-center pt-4">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-5 py-2 rounded-lg text-xs transition disabled:opacity-50"
                    >
                      {loadingMore ? "Loading more..." : "Load More Posts"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Right Hashtag & Trending Sidebar */}
          <aside className="hidden xl:block w-72 shrink-0 space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
              <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-1.5 mb-3">
                <Hash className="w-4 h-4 text-orange-500" /> Trending Hashtags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition ${
                      selectedTag === tag
                        ? "bg-orange-500 text-white border-orange-500 font-semibold"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-orange-50 hover:text-orange-600"
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
