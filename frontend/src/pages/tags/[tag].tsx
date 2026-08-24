import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Mainlayout from "@/Layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { Tag as TagIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function TagQuestionsPage() {
  const router = useRouter();
  const { tag } = router.query;
  const tagName = Array.isArray(tag) ? tag[0] : tag;

  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tagName) return;
    const fetchQuestions = async () => {
      try {
        const res = await axiosInstance.get("/question/getallquestion");
        const allQ = res.data.data || [];
        const filtered = allQ.filter((q: any) =>
          q.questiontags?.some((t: string) => t.toLowerCase() === tagName.toLowerCase())
        );
        setQuestions(filtered);
      } catch (error) {
        console.error("Error fetching tag questions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [tagName]);

  return (
    <Mainlayout>
      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Badge className="bg-orange-500 text-white text-base px-3 py-1 flex items-center gap-1.5">
            <TagIcon className="w-4 h-4" />
            [{tagName}]
          </Badge>
          <span className="text-gray-500 text-sm">
            {questions.length} {questions.length === 1 ? "question" : "questions"}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Questions tagged with <span className="font-semibold text-gray-800">[{tagName}]</span>.
        </p>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500">
            No questions found tagged with [{tagName}].
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q: any) => (
              <div
                key={q._id}
                className="border border-gray-200 rounded-lg p-4 bg-white hover:border-gray-300 transition"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex sm:flex-col items-center text-sm text-gray-600 sm:w-20 gap-4 sm:gap-2">
                    <div className="text-center">
                      <div className="font-semibold text-gray-800">
                        {(q.upvote?.length || 0) - (q.downvote?.length || 0)}
                      </div>
                      <div className="text-xs text-gray-500">votes</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-800">
                        {q.noofanswer || q.answer?.length || 0}
                      </div>
                      <div className="text-xs text-gray-500">answers</div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/questions/${q._id}`}
                      className="text-blue-600 hover:text-blue-800 text-base font-semibold mb-1 block"
                    >
                      {q.questiontitle}
                    </Link>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {q.questionbody}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        {q.questiontags?.map((t: string) => (
                          <Link key={t} href={`/tags/${encodeURIComponent(t)}`}>
                            <Badge
                              variant="secondary"
                              className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100"
                            >
                              {t}
                            </Badge>
                          </Link>
                        ))}
                      </div>

                      <div className="flex items-center text-xs text-gray-500">
                        <span className="mr-2">by {q.userposted || "User"}</span>
                        <span>asked {q.askedon ? new Date(q.askedon).toLocaleDateString() : ""}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Mainlayout>
  );
}
