import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { toast } from "react-toastify";
import { Bell, Heart, MessageSquare, UserPlus, CheckCheck, RefreshCw, AtSign } from "lucide-react";
import Navbar from "../../components/Navbar";
import SideBar from "../../components/SideBar";
import axiosInstance from "../../lib/axiosinstance";
import { useAuth } from "../../lib/AuthContext";
import { NotificationItem } from "../../types/feed";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/notification");
      setNotifications(res.data?.data || []);
      setUnreadCount(res.data?.meta?.unreadCount || 0);
    } catch (err) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await axiosInstance.patch(`/notification/read/${id}`);
      if (id === "all") {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
        toast.success("All notifications marked as read");
      } else {
        setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      toast.error("Failed to update notification");
    }
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-4 h-4 text-red-500 fill-red-500" />;
      case "comment":
      case "reply":
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case "mention":
        return <AtSign className="w-4 h-4 text-purple-500" />;
      case "follow":
        return <UserPlus className="w-4 h-4 text-emerald-500" />;
      default:
        return <Bell className="w-4 h-4 text-orange-500" />;
    }
  };

  return (
    <>
      <Head>
        <title>Notifications - StackOverflow Clone</title>
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />

        <div className="flex-1 max-w-7xl w-full mx-auto flex gap-6 px-4 py-6">
          <div className="hidden lg:block w-60 shrink-0">
            <SideBar />
          </div>

          <main className="flex-1 max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <Bell className="w-6 h-6 text-orange-500" /> Notifications
                  {unreadCount > 0 && (
                    <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </h1>
                <p className="text-xs text-gray-500 mt-1">Stay updated with likes, comments, mentions, and new followers.</p>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={() => handleMarkAsRead("all")}
                  className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200 transition"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
                <RefreshCw className="w-6 h-6 animate-spin text-orange-500 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">When someone interacts with your posts, you will see alerts here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`bg-white border rounded-xl p-4 transition shadow-xs flex items-start gap-3 ${
                      !n.read ? "border-orange-200 bg-orange-50/40" : "border-gray-200"
                    }`}
                  >
                    <div className="mt-0.5 p-2 rounded-full bg-gray-50 border border-gray-100">{renderIcon(n.type)}</div>

                    <div className="flex-1 text-xs space-y-1">
                      <p className="text-gray-800">
                        <span className="font-semibold text-gray-900">{n.sender?.name}</span>{" "}
                        {n.type === "like" && "liked your post"}
                        {n.type === "comment" && "commented on your post"}
                        {n.type === "reply" && "replied to your comment"}
                        {n.type === "mention" && "mentioned you in a comment"}
                        {n.type === "follow" && "started following you"}
                      </p>

                      {n.post && (
                        <Link href={`/feed#post-${n.post._id}`}>
                          <p className="text-gray-500 italic bg-gray-50 p-2 rounded border border-gray-100 line-clamp-1 hover:text-orange-600 cursor-pointer">
                            "{n.post.content}"
                          </p>
                        </Link>
                      )}

                      <p className="text-[10px] text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>

                    {!n.read && (
                      <button
                        onClick={() => handleMarkAsRead(n._id)}
                        className="text-[11px] text-orange-600 hover:underline font-medium"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
