import { useLocation, useNavigate } from "react-router-dom";
import StudentLayout from "../../layouts/StudentLayout";

function QuizResult() {
  const navigate = useNavigate();
  const { state } = useLocation();

  if (!state) {
    return (
      <StudentLayout>
        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold">
            No Result Found
          </h2>

          <button
            onClick={() => navigate("/student/my-courses")}
            className="mt-6 bg-amber-600 text-white px-6 py-3 rounded-lg"
          >
            Back to My Courses
          </button>
        </div>
      </StudentLayout>
    );
  }

  const {
    score,
    totalMarks,
    totalQuestions,
    correctAnswers,
    wrongAnswers,
  } = state;

  const percentage =
    totalMarks > 0
      ? Math.round((score / totalMarks) * 100)
      : 0;

  return (
    <StudentLayout>
      <div className="flex justify-center items-center min-h-[80vh]">

        <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-xl text-center">

          <h1 className="text-5xl mb-4">🎉</h1>

          <h2 className="text-4xl font-bold mb-6">
            Quiz Completed
          </h2>

          <p className="text-2xl mb-3">
            Score
          </p>

          <h1 className="text-6xl font-bold text-green-600 mb-8">
            {score} / {totalMarks}
          </h1>

          <div className="space-y-4 text-xl">

            <p>
              <strong>Correct Answers:</strong>{" "}
              {correctAnswers} / {totalQuestions}
            </p>

            <p>
              <strong>Wrong Answers:</strong>{" "}
              {wrongAnswers}
            </p>

            <p>
              <strong>Percentage:</strong>{" "}
              {percentage}%
            </p>

            <h2
              className={`text-3xl font-bold ${
                percentage >= 40
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {percentage >= 40 ? "PASS" : "FAIL"}
            </h2>

          </div>

          <button
            onClick={() => navigate("/student/my-courses")}
            className="mt-8 bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg"
          >
            Back to My Courses
          </button>

        </div>

      </div>
    </StudentLayout>
  );
}

export default QuizResult;