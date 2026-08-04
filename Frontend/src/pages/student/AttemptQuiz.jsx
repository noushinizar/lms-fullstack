import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import StudentLayout from "../../layouts/StudentLayout";

import { getQuizById } from "../../services/quizService";
import { getQuestions } from "../../services/questionService";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import { submitQuiz } from "../../services/quizService";
import { showSuccess, showError } from "../../utils/toast";
function AttemptQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  
  useEffect(() => {
    fetchQuiz();
  }, [quizId]);
 useEffect(() => {
  if (!quiz) return;

  if (timeLeft <= 0) {
    handleSubmit();
    return;
  }

  const timer = setInterval(() => {
    setTimeLeft((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(timer);
}, [quiz, timeLeft]);
  const fetchQuiz = async () => {
    try {
      const quizData = await getQuizById(quizId);
      setQuiz(quizData);
      setTimeLeft(quizData.duration * 60);
      const questionData = await getQuestions(quizId);
      setQuestions(questionData);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
  if (currentQuestion < questions.length - 1) {
    setCurrentQuestion(currentQuestion + 1);
  }
};

const previousQuestion = () => {
  if (currentQuestion > 0) {
    setCurrentQuestion(currentQuestion - 1);
  }
};

const handleSubmit = async () => {

  const unanswered = questions.filter(
    (q) => !answers[q._id]
  );

  if (unanswered.length > 0) {
    showError(
      `Please answer all ${unanswered.length} remaining question(s) before submitting.`
    );
    return;
  }

  try {

    const answerObject = {};

    questions.forEach((q) => {
      answerObject[q._id] = answers[q._id];
    });

    const result = await submitQuiz({
      quizId,
      answers: answerObject,
    });

    navigate("/student/quiz/result", {
      state: result,
    });

  } catch (error) {
    console.log(error);
  }

};
  if (loading) {
    return (
      <StudentLayout>
        <LoadingSpinner text="Loading Quiz..." />
      </StudentLayout>
    );
  }
const question = questions[currentQuestion];
const minutes = Math.floor(timeLeft / 60);

const seconds = timeLeft % 60;
  return (
    
    <StudentLayout>

      <h1 className="text-3xl font-bold mb-2">
  {quiz.title}
</h1>

<p className="text-gray-600 mb-8">
  {quiz.description}
</p>
<div className="bg-red-50 border border-red-300 rounded-xl p-4 mb-6 flex justify-between items-center">

  <h2 className="text-xl font-bold">
    ⏳ Time Remaining
  </h2>

  <span className="text-2xl font-bold text-red-600">

    {String(minutes).padStart(2, "0")}:

    {String(seconds).padStart(2, "0")}

  </span>

</div>
<div className="bg-white rounded-xl shadow p-5 mb-6">

  <h2 className="text-lg font-bold mb-4">
    Question Palette
  </h2>

  <div className="flex flex-wrap gap-3">

    {questions.map((q, index) => (

      <button
        key={q._id}
        onClick={() => setCurrentQuestion(index)}
        className={`w-12 h-12 rounded-lg font-bold transition
          ${
            currentQuestion === index
              ? "bg-blue-600 text-white"
              : answers[q._id]
              ? "bg-green-600 text-white"
              : "bg-gray-200"
          }`}
      >
        {index + 1}
      </button>

    ))}

  </div>

</div>

<div className="bg-white rounded-xl shadow p-8">

  <div className="flex justify-between mb-6">

    <h2 className="text-xl font-bold">
      Question {currentQuestion + 1} of {questions.length}
    </h2>

  </div>

  <h3 className="text-2xl font-semibold mb-8">
    {question.question}
  </h3>

  <div className="space-y-4">

    {question.options.map((option) => (

      <label
        key={option}
        className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
      >

        <input
          type="radio"
          name={question._id}
          checked={answers[question._id] === option}
          onChange={() =>
            setAnswers({
              ...answers,
              [question._id]: option,
            })
          }
        />

        {option}

      </label>

    ))}

  </div>
  <div className="flex justify-between mt-8">

  <button
    onClick={previousQuestion}
    disabled={currentQuestion === 0}
    className="bg-gray-500 text-white px-6 py-3 rounded-lg disabled:opacity-50"
  >
    Previous
  </button>

  <button
    onClick={nextQuestion}
    disabled={currentQuestion === questions.length - 1}
    className="bg-amber-600 text-white px-6 py-3 rounded-lg disabled:opacity-50"
  >
    Next
  </button>

</div>
  <div className="mt-8 text-center">

  <button
    onClick={handleSubmit}
    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg"
  >
    Submit Quiz
  </button>

</div>
</div>

    </StudentLayout>
  );
}

export default AttemptQuiz;