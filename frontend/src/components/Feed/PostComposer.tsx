import React, { useState } from "react";
import { toast } from "react-toastify";
import { Code, Image, Tag, Sparkles, Send, FileText, Award, Layers } from "lucide-react";
import axiosInstance from "../../lib/axiosinstance";
import { useAuth } from "../../lib/AuthContext";
import { Post, PostType } from "../../types/feed";

interface PostComposerProps {
  onPostCreated?: (newPost: Post) => void;
}

export const PostComposer: React.FC<PostComposerProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<PostType>("technical_update");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [imageUrl, setImageUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-6 text-center">
        <p className="text-gray-600 font-medium">Log in to create technical updates, share code, or showcase projects!</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Post content cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const parsedTags = tagsInput
        .split(/[\s,]+/)
        .map((t) => t.replace("#", "").trim())
        .filter(Boolean);

      const payload = {
        content: content.trim(),
        postType,
        codeSnippet: showCode || postType === "code_snippet" ? { code, language } : undefined,
        imageUrl: showImage ? imageUrl.trim() : "",
        tags: parsedTags,
      };

      const res = await axiosInstance.post("/post/create", payload);
      toast.success("Post published to Community Feed!");

      setContent("");
      setCode("");
      setImageUrl("");
      setTagsInput("");
      setShowCode(false);
      setShowImage(false);

      if (onPostCreated && res.data?.data) {
        onPostCreated(res.data.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to publish post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center text-lg">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 leading-tight">{user.name}</h3>
          <p className="text-xs text-gray-500">Share with the developer community</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Post Type Selector Pills */}
        <div className="flex flex-wrap gap-2 text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setPostType("technical_update");
              setShowCode(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition ${
              postType === "technical_update"
                ? "bg-orange-50 text-orange-600 border-orange-200 font-semibold"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Technical Update
          </button>

          <button
            type="button"
            onClick={() => {
              setPostType("code_snippet");
              setShowCode(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition ${
              postType === "code_snippet"
                ? "bg-blue-50 text-blue-600 border-blue-200 font-semibold"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
            }`}
          >
            <Code className="w-3.5 h-3.5" /> Code Snippet
          </button>

          <button
            type="button"
            onClick={() => setPostType("project_showcase")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition ${
              postType === "project_showcase"
                ? "bg-purple-50 text-purple-600 border-purple-200 font-semibold"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Project Showcase
          </button>

          <button
            type="button"
            onClick={() => setPostType("learning_achievement")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition ${
              postType === "learning_achievement"
                ? "bg-emerald-50 text-emerald-600 border-emerald-200 font-semibold"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
            }`}
          >
            <Award className="w-3.5 h-3.5" /> Achievement
          </button>
        </div>

        {/* Content Textarea */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            postType === "code_snippet"
              ? "Explain what this code snippet does..."
              : postType === "project_showcase"
              ? "Tell us about your project features, architecture, and live links..."
              : postType === "learning_achievement"
              ? "Share what you learned today or key milestones achieved..."
              : "What are you working on or building today?"
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm resize-none h-24"
        />

        {/* Optional Code Snippet Input */}
        {(showCode || postType === "code_snippet") && (
          <div className="bg-gray-900 rounded-lg p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between text-gray-300">
              <span className="font-mono text-xs flex items-center gap-1">
                <Code className="w-3.5 h-3.5" /> Code Editor
              </span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-800 text-gray-200 border border-gray-700 rounded px-2 py-1 text-xs focus:outline-none"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="sql">SQL</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
              </select>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Paste your code snippet here..."
              className="w-full bg-gray-950 text-emerald-400 font-mono p-3 rounded border border-gray-800 focus:outline-none text-xs h-32 resize-none"
            />
          </div>
        )}

        {/* Optional Image URL Input */}
        {showImage && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste Image URL (https://...)"
              className="flex-1 p-2 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-orange-500"
            />
          </div>
        )}

        {/* Hashtags Input */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs">
          <Tag className="w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Add hashtags separated by spaces (e.g. #react #nextjs #webdev)"
            className="w-full bg-transparent text-gray-700 focus:outline-none text-xs"
          />
        </div>

        {/* Action Controls Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <button
              type="button"
              onClick={() => setShowCode(!showCode)}
              className={`p-2 rounded-lg hover:bg-gray-100 transition flex items-center gap-1 ${
                showCode ? "text-blue-600 font-medium bg-blue-50" : ""
              }`}
            >
              <Code className="w-4 h-4 text-blue-500" /> Code
            </button>

            <button
              type="button"
              onClick={() => setShowImage(!showImage)}
              className={`p-2 rounded-lg hover:bg-gray-100 transition flex items-center gap-1 ${
                showImage ? "text-emerald-600 font-medium bg-emerald-50" : ""
              }`}
            >
              <Image className="w-4 h-4 text-emerald-500" /> Image
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition disabled:opacity-50"
          >
            {loading ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Publish Post
          </button>
        </div>
      </form>
    </div>
  );
};
