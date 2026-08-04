import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import StudentLayout from "../../layouts/StudentLayout";

import {
  getQuizzes,
  getAttemptStatus,
} from "../../services/quizService";

import { getQuestions } from "../../services/questionService";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";

function Quiz() {
  const { id } = useParams();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, [id]);

  const fetchQuizzes = async () => {
    try {

      const quizData = await getQuizzes(id);

      const quizzesWithDetails = await Promise.all(

        quizData.map(async (quiz) => {

          const questions = await getQuestions(quiz._id);

          const status = await getAttemptStatus(quiz._id);

          return {
            ...quiz,
            questionCount: questions.length,
            attempted: status.attempted,
          };

        })

      );

      setQuizzes(quizzesWithDetails);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <LoadingSpinner text="Loading quizzes..." />
      </StudentLayout>
    );
  }

  if (quizzes.length === 0) {
    return (
      <StudentLayout>
        <EmptyState
          icon="📝"
          title="No Quizzes Available"
          description="Your mentor hasn't added any quizzes yet."
        />
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>

      <h1 className="text-3xl font-bold mb-8">
        Course Quizzes
      </h1>

      <div className="space-y-5">

        {quizzes.map((quiz) => (

          <div
            key={quiz._id}
            className="bg-white rounded-xl shadow p-6"
          >

            <h2 className="text-2xl font-bold">
              📝 {quiz.title}
            </h2>

            <p className="text-gray-600 mt-2">
              {quiz.description}
            </p>

            <div className="flex gap-8 mt-4 text-gray-700">

              <p>
                ⏱ <strong>Duration:</strong>{" "}
                {quiz.duration} Minutes
              </p>

              <p>
                ❓ <strong>Questions:</strong>{" "}
                {quiz.questionCount}
              </p>

            </div>

            <div className="mt-6">

              {quiz.attempted ? (

                <button
                  disabled
                  className="bg-gray-400 text-white px-6 py-3 rounded-lg cursor-not-allowed"
                >
                  ✅ Already Attempted
                </button>

              ) : (

                <Link
                  to={`/student/quiz/${quiz._id}/attempt`}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
                >
                  Start Quiz
                </Link>

              )}

            </div>

          </div>

        ))}

      </div>

    </StudentLayout>
  );
}

export default Quiz;