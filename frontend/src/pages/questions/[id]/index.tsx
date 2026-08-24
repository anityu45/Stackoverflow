import QuestionDetail from "@/components/QuestionDetail";
import Mainlayout from "@/Layout/Mainlayout";
import { useRouter } from "next/router";
import React from "react";

const QuestionDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <Mainlayout>
      <div className="max-w-5xl mx-auto">
        <QuestionDetail questionId={Array.isArray(id) ? id[0] : id} />
      </div>
    </Mainlayout>
  );
};

export default QuestionDetailPage;
