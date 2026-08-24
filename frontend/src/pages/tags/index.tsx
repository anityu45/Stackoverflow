import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Mainlayout from "@/Layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { Search, Tag as TagIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function TagsPage() {
  const [tagStats, setTagStats] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await axiosInstance.get("/question/getallquestion");
        const questions = res.data.data || [];
        const counts: Record<string, number> = {};

        questions.forEach((q: any) => {
          if (Array.isArray(q.questiontags)) {
            q.questiontags.forEach((tag: string) => {
              const clean = tag.trim().toLowerCase();
              if (clean) {
                counts[clean] = (counts[clean] || 0) + 1;
              }
            });
          }
        });

        // Add default popular tags if few exist
        const defaultTags = ["javascript", "react", "next.js", "node.js", "typescript", "mongodb", "python", "css", "html"];
        defaultTags.forEach((dt) => {
          if (!counts[dt]) {
            counts[dt] = 1;
          }
        });

        const sorted = Object.entries(counts).map(([name, count]) => ({
          name,
          count,
        })).sort((a, b) => b.count - a.count);

        setTagStats(sorted);
      } catch (error) {
        console.error("Error fetching tags:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, []);

  const filteredTags = tagStats.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Mainlayout>
      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Tags</h1>
        <p className="text-sm text-gray-600 mb-6 max-w-3xl">
          A tag is a keyword or label that categorizes your question with other, similar questions.
          Using the right tags makes it easier for others to find and answer your question.
        </p>

        <div className="mb-6 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Filter by tag name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTags.map((tag) => (
              <Link
                key={tag.name}
                href={`/tags/${encodeURIComponent(tag.name)}`}
                className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm hover:border-blue-300 transition block"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold px-2.5 py-1 border border-blue-100"
                  >
                    <TagIcon className="w-3 h-3 mr-1" />
                    {tag.name}
                  </Badge>
                  <span className="text-xs text-gray-500 font-medium">
                    {tag.count} {tag.count === 1 ? "question" : "questions"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">
                  Explore top questions tagged with #{tag.name}.
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Mainlayout>
  );
}
