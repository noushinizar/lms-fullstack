import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getQuizzes } from "../../services/quizService";

import LoadingSpinner from "../common/LoadingSpinner";
import EmptyState from "../common/EmptyState";

function QuizTab({ courseId }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, [courseId]);

  const fetchQuizzes = async () => {
    try {
      const data = await getQuizzes(courseId);
      setQuizzes(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading quizzes..." />;
  }

  if (quizzes.length === 0) {
    return (
      <EmptyState
        icon="📝"
        title="No Quizzes Available"
        description="Your mentor hasn't added any quizzes yet."
      />
    );
  }

  return (
    <div className="space-y-5">
      {quizzes.map((quiz) => (
        <div
          key={quiz._id}
          className="bg-white rounded-xl shadow p-6"
        >
          <h2 className="text-xl font-bold">
            {quiz.title}
          </h2>

          <p className="text-gray-600 mt-2">
            {quiz.description}
          </p>

          <p className="mt-3">
            <strong>Duration:</strong> {quiz.duration} Minutes
          </p>

          <button
            onClick={() =>
              navigate(`/student/quiz/${quiz._id}/attempt`)
            }
            className="mt-5 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg"
          >
            Start Quiz
          </button>
        </div>
      ))}
    </div>
  );
}

export default QuizTab;