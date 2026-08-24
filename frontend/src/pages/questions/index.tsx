import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Mainlayout from "@/Layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { MessageSquare, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"newest" | "unanswered" | "voted">("newest");
  const router = useRouter();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axiosInstance.get("/question/getallquestion");
        setQuestions(res.data.data || []);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const filteredQuestions = questions
    .filter((q) => {
      const matchSearch =
        q.questiontitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.questionbody?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.questiontags?.some((t: string) => t.toLowerCase().includes(searchTerm.toLowerCase()));
      if (filter === "unanswered") {
        return matchSearch && (q.noofanswer === 0 || !q.answer || q.answer.length === 0);
      }
      return matchSearch;
    })
    .sort((a, b) => {
      if (filter === "voted") {
        const scoreA = (a.upvote?.length || 0) - (a.downvote?.length || 0);
        const scoreB = (b.upvote?.length || 0) - (b.downvote?.length || 0);
        return scoreB - scoreA;
      }
      return new Date(b.askedon).getTime() - new Date(a.askedon).getTime();
    });

  return (
    <Mainlayout>
      <main className="min-w-0 p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">All Questions</h1>
            <p className="text-sm text-gray-500 mt-1">
              Explore user-submitted questions, share knowledge, and help fellow developers.
            </p>
          </div>
          <button
            onClick={() => router.push("/ask")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium whitespace-nowrap shadow-sm transition"
          >
            Ask Question
          </button>
        </div>

        <div className="w-full mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Filter questions by title or tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setFilter("newest")}
                className={`px-3 py-1.5 rounded text-xs sm:text-sm font-medium transition ${
                  filter === "newest"
                    ? "bg-orange-100 text-orange-800 border border-orange-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => setFilter("unanswered")}
                className={`px-3 py-1.5 rounded text-xs sm:text-sm font-medium transition ${
                  filter === "unanswered"
                    ? "bg-orange-100 text-orange-800 border border-orange-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Unanswered
              </button>
              <button
                onClick={() => setFilter("voted")}
                className={`px-3 py-1.5 rounded text-xs sm:text-sm font-medium transition ${
                  filter === "voted"
                    ? "bg-orange-100 text-orange-800 border border-orange-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Highest Voted
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-500 mb-4 font-medium">
            Showing {filteredQuestions.length} questions
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500">
              <MessageSquare className="w-10 h-10 mx-auto text-gray-400 mb-3" />
              <p className="font-semibold text-gray-700 mb-1">No questions found</p>
              <p className="text-sm">Try adjusting your filter or search criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((q: any) => (
                <div
                  key={q._id}
                  className="border border-gray-200 rounded-lg p-4 bg-white hover:border-gray-300 hover:shadow-sm transition"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex sm:flex-col items-center justify-start text-sm text-gray-600 sm:w-20 gap-4 sm:gap-2 pt-1">
                      <div className="text-center">
                        <div className="font-semibold text-gray-800">
                          {(q.upvote?.length || 0) - (q.downvote?.length || 0)}
                        </div>
                        <div className="text-xs text-gray-500">votes</div>
                      </div>
                      <div className="text-center">
                        <div
                          className={`font-semibold px-2 py-0.5 rounded text-xs ${
                            (q.noofanswer || q.answer?.length || 0) > 0
                              ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                              : "text-gray-600"
                          }`}
                        >
                          {q.noofanswer || q.answer?.length || 0}
                        </div>
                        <div className="text-xs text-gray-500">answers</div>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/questions/${q._id}`}
                        className="text-blue-600 hover:text-blue-800 text-base font-semibold mb-1.5 block leading-snug"
                      >
                        {q.questiontitle}
                      </Link>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                        {q.questionbody}
                      </p>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-1.5">
                          {q.questiontags?.map((tag: string) => (
                            <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`}>
                              <Badge
                                variant="secondary"
                                className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer border border-blue-100"
                              >
                                {tag}
                              </Badge>
                            </Link>
                          ))}
                        </div>

                        <div className="flex items-center text-xs text-gray-500 flex-shrink-0 gap-1 mt-2 sm:mt-0">
                          <Link href={`/users/${q.userid}`} className="flex items-center">
                            <Avatar className="w-5 h-5 mr-1.5">
                              <AvatarFallback className="text-[10px] bg-orange-100 text-orange-800">
                                {q.userposted?.[0]?.toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-blue-600 hover:underline font-medium mr-1.5">
                              {q.userposted || "Anonymous"}
                            </span>
                          </Link>
                          <span>asked {q.askedon ? new Date(q.askedon).toLocaleDateString() : "recently"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </Mainlayout>
  );
}
