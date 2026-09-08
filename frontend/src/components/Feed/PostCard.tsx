import React, { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Flag,
  Trash2,
  Code,
  UserPlus,
  UserCheck,
  Award,
  Layers,
  FileText,
  CornerDownRight,
  Send,
  MoreVertical,
} from "lucide-react";
import axiosInstance from "../../lib/axiosinstance";
import { useAuth } from "../../lib/AuthContext";
import { Post, CommentItem } from "../../types/feed";

interface PostCardProps {
  post: Post;
  onPostDeleted?: (postId: string) => void;
  onTagClick?: (tag: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post: initialPost, onPostDeleted, onTagClick }) => {
  const { user } = useAuth();
  const [post, setPost] = useState<Post>(initialPost);
  const [liked, setLiked] = useState(!!initialPost.isLiked);
  const [likesCount, setLikesCount] = useState(initialPost.likes?.length || 0);
  const [bookmarked, setBookmarked] = useState(!!initialPost.isBookmarked);
  const [shareCount, setShareCount] = useState(initialPost.shareCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwner = user && user._id === post.user?._id;
  const isAdmin = user && user.role === "admin";

  const handleLike = async () => {
    if (!user) {
      toast.error("Please login to like posts");
      return;
    }
    const previousLiked = liked;
    const previousCount = likesCount;
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);

    try {
      const res = await axiosInstance.patch(`/post/like/${post._id}`);
      setLiked(res.data.data.isLiked);
      setLikesCount(res.data.data.likesCount);
    } catch (err) {
      setLiked(previousLiked);
      setLikesCount(previousCount);
      toast.error("Failed to update like status");
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      toast.error("Please login to bookmark posts");
      return;
    }
    const previous = bookmarked;
    setBookmarked(!bookmarked);

    try {
      const res = await axiosInstance.patch(`/post/bookmark/${post._id}`);
      setBookmarked(res.data.data.isBookmarked);
      toast.success(res.data.data.isBookmarked ? "Post saved to bookmarks" : "Removed from bookmarks");
    } catch (err) {
      setBookmarked(previous);
      toast.error("Failed to update bookmark");
    }
  };

  const handleShare = async () => {
    try {
      await axiosInstance.post(`/post/share/${post._id}`);
      setShareCount(shareCount + 1);
      if (navigator.clipboard) {
        navigator.clipboard.writeText(`${window.location.origin}/feed#post-${post._id}`);
        toast.info("Link copied to clipboard!");
      }
    } catch (err) {
      toast.error("Failed to share post");
    }
  };

  const handleToggleComments = async () => {
    if (!showComments && comments.length === 0) {
      fetchComments();
    }
    setShowComments(!showComments);
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const res = await axiosInstance.get(`/comment/post/${post._id}`);
      setComments(res.data?.data || []);
    } catch (err) {
      toast.error("Failed to load comments");
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (parentCommentId?: string) => {
    if (!user) {
      toast.error("Please login to comment");
      return;
    }
    const text = parentCommentId ? replyText : commentText;
    if (!text.trim()) return;

    setSubmittingComment(true);
    try {
      await axiosInstance.post(`/comment/post/${post._id}`, {
        content: text.trim(),
        parentCommentId,
      });
      toast.success(parentCommentId ? "Reply posted" : "Comment posted");
      if (parentCommentId) {
        setReplyText("");
        setReplyingToId(null);
      } else {
        setCommentText("");
      }
      fetchComments();
      setPost((prev) => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to post comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await axiosInstance.delete(`/comment/delete/${commentId}`);
      toast.success("Comment deleted");
      fetchComments();
      setPost((prev) => ({ ...prev, commentCount: Math.max(0, (prev.commentCount || 1) - 1) }));
    } catch (err) {
      toast.error("Failed to delete comment");
    }
  };

  const handleDeletePost = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await axiosInstance.delete(`/post/delete/${post._id}`);
      toast.success("Post deleted");
      if (onPostDeleted) onPostDeleted(post._id);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete post");
    }
  };

  const handleReportPost = async () => {
    if (!reportReason.trim()) {
      toast.error("Please provide a reason for reporting");
      return;
    }
    try {
      await axiosInstance.post(`/report/${post._id}`, { reason: reportReason.trim() });
      toast.success("Report submitted to moderators");
      setShowReportModal(false);
      setReportReason("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit report");
    }
  };

  const handleFollowToggle = async () => {
    if (!user) {
      toast.error("Please login to follow users");
      return;
    }
    try {
      const res = await axiosInstance.post(`/follow/toggle/${post.user._id}`);
      setIsFollowing(res.data.data.isFollowing);
      toast.success(res.data.message);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to follow user");
    }
  };

  const renderPostTypeBadge = (type: string) => {
    switch (type) {
      case "code_snippet":
        return (
          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
            <Code className="w-3 h-3" /> Code Snippet
          </span>
        );
      case "project_showcase":
        return (
          <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
            <Layers className="w-3 h-3" /> Showcase
          </span>
        );
      case "learning_achievement":
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
            <Award className="w-3 h-3" /> Achievement
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 border border-gray-200 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
            <FileText className="w-3 h-3" /> Update
          </span>
        );
    }
  };

  return (
    <div id={`post-${post._id}`} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-4">
      {/* Header: User avatar, info, post type badge, follow button */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Link href={`/users/${post.user?._id}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold flex items-center justify-center cursor-pointer text-lg shadow-xs">
              {post.user?.name ? post.user.name.charAt(0).toUpperCase() : "U"}
            </div>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link href={`/users/${post.user?._id}`}>
                <span className="font-semibold text-gray-900 text-sm cursor-pointer hover:text-orange-600 transition">
                  {post.user?.name}
                </span>
              </Link>
              {post.user?.subscription?.plan && post.user.subscription.plan !== "free" && (
                <span className="bg-amber-100 text-amber-800 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
                  {post.user.subscription.plan}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {renderPostTypeBadge(post.postType)}

          {user && !isOwner && (
            <button
              onClick={handleFollowToggle}
              className="p-1.5 rounded-full text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition"
              title={isFollowing ? "Unfollow" : "Follow User"}
            >
              {isFollowing ? <UserCheck className="w-4 h-4 text-orange-600" /> : <UserPlus className="w-4 h-4" />}
            </button>
          )}

          {(isOwner || isAdmin) && (
            <button
              onClick={handleDeletePost}
              className="p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
              title="Delete Post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content Text */}
      <div className="text-gray-800 text-sm whitespace-pre-line mb-3 leading-relaxed">{post.content}</div>

      {/* Code Snippet Box */}
      {post.codeSnippet && post.codeSnippet.code && (
        <div className="bg-gray-950 rounded-lg p-3.5 my-3 text-xs overflow-x-auto border border-gray-800">
          <div className="flex items-center justify-between text-gray-400 border-b border-gray-800 pb-1.5 mb-2 font-mono text-[11px]">
            <span>{post.codeSnippet.language || "javascript"}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(post.codeSnippet?.code || "");
                toast.info("Code copied!");
              }}
              className="hover:text-gray-200 transition text-[11px]"
            >
              Copy
            </button>
          </div>
          <pre className="text-emerald-400 font-mono leading-relaxed">{post.codeSnippet.code}</pre>
        </div>
      )}

      {/* Image Preview */}
      {post.imageUrl && (
        <div className="my-3 rounded-lg overflow-hidden border border-gray-200 max-h-96">
          <img src={post.imageUrl} alt="Post content" className="w-full object-cover" />
        </div>
      )}

      {/* Hashtags Chips */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagClick && onTagClick(tag)}
              className="text-xs text-orange-600 bg-orange-50 hover:bg-orange-100 font-medium px-2 py-0.5 rounded transition"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-gray-500 text-xs font-medium">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition ${
              liked ? "text-red-500 font-bold" : "hover:text-red-500"
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
            <span>{likesCount}</span>
          </button>

          <button onClick={handleToggleComments} className="flex items-center gap-1.5 hover:text-blue-500 transition">
            <MessageSquare className="w-4 h-4" />
            <span>{post.commentCount || 0}</span>
          </button>

          <button onClick={handleShare} className="flex items-center gap-1.5 hover:text-purple-500 transition">
            <Share2 className="w-4 h-4" />
            <span>{shareCount}</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleBookmark}
            className={`transition ${bookmarked ? "text-amber-500 font-bold" : "hover:text-amber-500"}`}
            title="Bookmark"
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-amber-500" : ""}`} />
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="hover:text-red-500 transition"
            title="Report Post"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inline Comments Section */}
      {showComments && (
        <div className="mt-4 border-t border-gray-100 pt-3 space-y-3">
          {/* Add Comment Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 p-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
            />
            <button
              onClick={() => handleAddComment()}
              disabled={submittingComment || !commentText.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition disabled:opacity-50 text-xs flex items-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Comments List */}
          {loadingComments ? (
            <p className="text-xs text-gray-400 text-center py-2">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-2">No comments yet. Be the first to comment!</p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment._id} className="bg-gray-50 rounded-lg p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{comment.user?.name}</span>
                      <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleTimeString()}</span>
                    </div>
                    {(user && (user._id === comment.user?._id || isOwner || isAdmin)) && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <p className="text-gray-800">{comment.content}</p>

                  <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    <button
                      onClick={() => setReplyingToId(replyingToId === comment._id ? null : comment._id)}
                      className="hover:text-orange-600 transition flex items-center gap-1 font-medium"
                    >
                      <CornerDownRight className="w-3 h-3" /> Reply
                    </button>
                  </div>

                  {/* Reply Input */}
                  {replyingToId === comment._id && (
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Reply to ${comment.user?.name}...`}
                        className="flex-1 p-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-orange-500"
                        onKeyDown={(e) => e.key === "Enter" && handleAddComment(comment._id)}
                      />
                      <button
                        onClick={() => handleAddComment(comment._id)}
                        disabled={submittingComment || !replyText.trim()}
                        className="bg-orange-500 text-white px-2.5 py-1 rounded text-xs"
                      >
                        Reply
                      </button>
                    </div>
                  )}

                  {/* Nested Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-4 pl-3 border-l-2 border-orange-200 space-y-2 pt-2">
                      {comment.replies.map((reply) => (
                        <div key={reply._id} className="bg-white p-2 rounded border border-gray-200 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-gray-900">{reply.user?.name}</span>
                            {(user && (user._id === reply.user?._id || isOwner || isAdmin)) && (
                              <button
                                onClick={() => handleDeleteComment(reply._id)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-gray-800">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 max-w-md w-full shadow-lg space-y-4">
            <h3 className="font-semibold text-gray-900 text-base flex items-center gap-2">
              <Flag className="w-4 h-4 text-red-500" /> Report Content
            </h3>
            <p className="text-xs text-gray-500">
              Please state why this post violates community guidelines (spam, harassment, inappropriate content).
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Reason for reporting..."
              className="w-full p-2.5 border border-gray-300 rounded-lg text-xs h-24 resize-none"
            />
            <div className="flex justify-end gap-2 text-xs font-medium">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button onClick={handleReportPost} className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700">
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
