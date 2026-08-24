import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  Clock,
  Flag,
  History,
  Share,
  Trash,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";

const QuestionDetail = ({ questionId }: any) => {
  const router = useRouter();
  const [question, setQuestion] = useState<any>(null);
  const [newAnswer, setNewAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!questionId) return;
    const fetchQuestionData = async () => {
      setLoading(true);
      try {
        let matched: any = null;
        try {
          const res = await axiosInstance.get(`/question/get/${questionId}`);
          matched = res.data.data;
        } catch (err) {
          const res = await axiosInstance.get("/question/getallquestion");
          matched = res.data.data?.find((q: any) => q._id === questionId);
        }
        if (matched) {
          setQuestion(matched);
        }
      } catch (error) {
        console.error("Error loading question detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestionData();
  }, [questionId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500 my-6">
        No question found or invalid question ID.
      </div>
    );
  }

  const handleVote = async (vote: string) => {
    if (!user) {
      toast.info("Please login to vote");
      router.push("/auth");
      return;
    }
    try {
      const res = await axiosInstance.patch(`/question/vote/${question._id}`, {
        value: vote,
        userid: user._id,
      });
      if (res.data.data) {
        setQuestion(res.data.data);
        toast.success("Vote updated");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to vote question");
    }
  };

  const handleBookmark = () => {
    setQuestion((prev: any) => ({ ...prev, isBookmarked: !prev?.isBookmarked }));
  };

  const handleSubmitAnswer = async () => {
    if (!user) {
      toast.info("Please login to answer");
      router.push("/auth");
      return;
    }
    if (!newAnswer.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await axiosInstance.post(
        `/answer/postanswer/${question._id}`,
        {
          answerbody: newAnswer,
          useranswered: user.name,
          userid: user._id,
        }
      );
      if (res.data.data) {
        setQuestion(res.data.data);
        setNewAnswer("");
        toast.success("Answer posted successfully");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to post answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!user) {
      toast.info("Please login to delete your question");
      router.push("/auth");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this question?"))
      return;
    try {
      const res = await axiosInstance.delete(
        `/question/delete/${question._id}`
      );
      if (res.data.message) {
        toast.success(res.data.message);
        router.push("/");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete question");
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    if (!user) {
      toast.info("Please login to delete your answer");
      router.push("/auth");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this answer?"))
      return;
    try {
      const res = await axiosInstance.delete(
        `/answer/delete/${question._id}`,
        {
          data: { answerid: answerId },
        }
      );
      if (res.data.data) {
        setQuestion(res.data.data);
        toast.success("Answer deleted");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete answer");
    }
  };

  const formatText = (text: string) => {
    if (!text) return "";
    return text
      .replace(/## (.*)/g, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-900">$1</h3>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-3 text-sm"><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm text-pink-600 font-mono">$1</code>')
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/^/, '<p class="mb-3">')
      .replace(/$/, "</p>");
  };

  const upvotesCount = question.upvote?.length || 0;
  const downvotesCount = question.downvote?.length || 0;
  const netVotes = upvotesCount - downvotesCount;
  const answersList = question.answer || [];

  return (
    <div className="max-w-5xl mx-auto p-4 lg:p-6">
      {/* Question Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-xl lg:text-2xl font-bold mb-3 text-gray-900 leading-snug">
          {question.questiontitle}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>
              Asked {question.askedon ? new Date(question.askedon).toLocaleDateString() : "recently"}
            </span>
          </div>
          <div>
            Answers: <span className="font-semibold text-gray-700">{answersList.length}</span>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <Card className="mb-8 shadow-sm">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            {/* Voting Section */}
            <div className="flex sm:flex-col items-center justify-start p-4 sm:p-6 border-b sm:border-b-0 sm:border-r border-gray-200 bg-gray-50/50 min-w-[75px]">
              <Button
                variant="ghost"
                size="sm"
                className="p-1 text-gray-500 hover:text-orange-600 hover:bg-orange-50"
                onClick={() => handleVote("upvote")}
                title="Upvote"
              >
                <ChevronUp className="w-7 h-7" />
              </Button>
              <span className="font-bold text-lg text-gray-800 my-1">{netVotes}</span>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 text-gray-500 hover:text-orange-600 hover:bg-orange-50"
                onClick={() => handleVote("downvote")}
                title="Downvote"
              >
                <ChevronDown className="w-7 h-7" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`p-1 mt-4 ${
                  question?.isBookmarked ? "text-amber-500" : "text-gray-400 hover:text-amber-500"
                }`}
                onClick={handleBookmark}
                title="Bookmark"
              >
                <Bookmark className="w-5 h-5" fill={question?.isBookmarked ? "currentColor" : "none"} />
              </Button>
            </div>

            <div className="flex-1 p-4 sm:p-6">
              <div
                className="prose max-w-none text-gray-800 leading-relaxed text-sm lg:text-base mb-6"
                dangerouslySetInnerHTML={{ __html: formatText(question.questionbody) }}
              />

              <div className="flex flex-wrap gap-1.5 mb-6">
                {question.questiontags?.map((tag: string) => (
                  <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`}>
                    <Badge
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer border border-blue-100 text-xs px-2.5 py-0.5"
                    >
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  {question.userid === user?._id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDeleteQuestion}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
                    >
                      <Trash className="w-3.5 h-3.5 mr-1" />
                      Delete Question
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-600 bg-blue-50/70 border border-blue-100 p-2.5 rounded-lg">
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="text-xs bg-blue-200 text-blue-800">
                      {question.userposted?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-xs text-gray-400">asked by</div>
                    <Link
                      href={`/users/${question.userid}`}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      {question.userposted || "Anonymous"}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answers List */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4 text-gray-900 border-b pb-2">
          {answersList.length} {answersList.length === 1 ? "Answer" : "Answers"}
        </h2>

        <div className="space-y-4">
          {answersList.map((ans: any, idx: number) => (
            <Card key={ans._id || idx} className="shadow-sm border-gray-200">
              <CardContent className="p-4 sm:p-6">
                <div
                  className="prose max-w-none text-gray-800 text-sm leading-relaxed mb-4"
                  dangerouslySetInnerHTML={{ __html: formatText(ans.answerbody) }}
                />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  <div>
                    {ans.userid === user?._id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAnswer(ans._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs p-1 h-auto"
                      >
                        <Trash className="w-3.5 h-3.5 mr-1" />
                        Delete Answer
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 p-2 rounded-md">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-[10px] bg-emerald-100 text-emerald-800">
                        {ans.useranswered?.[0]?.toUpperCase() || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="text-gray-400 mr-1">answered by</span>
                      <Link href={`/users/${ans.userid}`} className="text-blue-600 font-semibold hover:underline">
                        {ans.useranswered || "Community Member"}
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Answer Form */}
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-base font-bold mb-3 text-gray-900">Your Answer</h3>
          <Textarea
            placeholder="Write your answer here... Support formatting with line breaks and markdown syntax."
            value={newAnswer}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewAnswer(e.target.value)}
            className="min-h-36 mb-4 font-sans text-sm"
          />
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <Button
              onClick={handleSubmitAnswer}
              disabled={!newAnswer.trim() || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 text-sm"
            >
              {isSubmitting ? "Posting..." : "Post Your Answer"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionDetail;
