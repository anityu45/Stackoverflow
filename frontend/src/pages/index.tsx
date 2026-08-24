import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Mainlayout from "@/Layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { MessageSquarePlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Home() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"newest" | "active" | "unanswered">("newest");
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

  const displayedQuestions = [...questions]
    .filter((q) => {
      if (filter === "unanswered") {
        return (q.noofanswer || q.answer?.length || 0) === 0;
      }
      return true;
    })
    .sort((a, b) => {
      if (filter === "active") {
        return (b.answer?.length || 0) - (a.answer?.length || 0);
      }
      return new Date(b.askedon).getTime() - new Date(a.askedon).getTime();
    });

  if (loading) {
    return (
      <Mainlayout>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <main className="min-w-0 p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b pb-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Top Questions</h1>
            <p className="text-xs text-gray-500 mt-0.5">Explore community questions and answers</p>
          </div>
          <button
            onClick={() => router.push("/ask")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium whitespace-nowrap shadow-sm transition"
          >
            Ask Question
          </button>
        </div>

        <div className="w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 text-sm gap-2">
            <span className="text-xs font-semibold text-gray-500">
              {displayedQuestions.length} {displayedQuestions.length === 1 ? "question" : "questions"}
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setFilter("newest")}
                className={`px-3 py-1 rounded text-xs font-medium transition ${
                  filter === "newest"
                    ? "bg-orange-100 text-orange-800 border border-orange-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => setFilter("active")}
                className={`px-3 py-1 rounded text-xs font-medium transition ${
                  filter === "active"
                    ? "bg-orange-100 text-orange-800 border border-orange-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter("unanswered")}
                className={`px-3 py-1 rounded text-xs font-medium transition ${
                  filter === "unanswered"
                    ? "bg-orange-100 text-orange-800 border border-orange-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Unanswered
              </button>
            </div>
          </div>

          {displayedQuestions.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-10 text-center text-gray-600 my-4">
              <MessageSquarePlus className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-base font-semibold text-gray-800 mb-1">No questions found</h3>
              <p className="text-sm text-gray-500 mb-4">Be the first developer to ask a public question!</p>
              <button
                onClick={() => router.push("/ask")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition shadow-sm"
              >
                Ask Question
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedQuestions.map((q: any) => {
                const votesCount = (q.upvote?.length || 0) - (q.downvote?.length || 0);
                const answersCount = q.noofanswer || q.answer?.length || 0;

                return (
                  <div key={q._id} className="border-b border-gray-200 pb-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex sm:flex-col items-center justify-start text-sm text-gray-600 sm:w-20 gap-4 sm:gap-2 pt-1">
                        <div className="text-center">
                          <div className="font-semibold text-gray-800">{votesCount}</div>
                          <div className="text-[11px] text-gray-500">votes</div>
                        </div>
                        <div className="text-center">
                          <div
                            className={`font-semibold px-2 py-0.5 rounded text-xs ${
                              answersCount > 0
                                ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                                : "text-gray-500"
                            }`}
                          >
                            {answersCount}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            {answersCount === 1 ? "answer" : "answers"}
                          </div>
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

                          <div className="flex items-center text-xs text-gray-500 flex-shrink-0 gap-1 mt-1 sm:mt-0">
                            <Link href={`/users/${q.userid}`} className="flex items-center">
                              <Avatar className="w-5 h-5 mr-1.5">
                                <AvatarFallback className="text-[10px] bg-orange-100 text-orange-800 font-bold">
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
                );
              })}
            </div>
          )}
        </div>
      </main>
    </Mainlayout>
  );
}
