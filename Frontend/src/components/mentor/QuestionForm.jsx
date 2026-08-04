import { useEffect, useState } from "react";

function QuestionForm({ initialData, onSubmit, loading }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [marks, setMarks] = useState(1);

  useEffect(() => {
    if (initialData) {
      setQuestion(initialData.question || "");
      setOptions(initialData.options || ["", "", "", ""]);
      setCorrectAnswer(initialData.correctAnswer || "");
      setMarks(initialData.marks || 1);
    } else {
      setQuestion("");
      setOptions(["", "", "", ""]);
      setCorrectAnswer("");
      setMarks(1);
    }
  }, [initialData]);

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);

    
    if (correctAnswer === options[index]) {
      setCorrectAnswer(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      question,
      options,
      correctAnswer,
      marks: Number(marks),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Question */}

      <div>
        <label className="block font-semibold mb-2">
          Question
        </label>

        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your question..."
          className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
          rows={3}
          required
        />
      </div>

      {/* Options */}

      {options.map((option, index) => (
        <div key={index}>
          <label className="block font-semibold mb-2">
            Option {String.fromCharCode(65 + index)}
          </label>

          <input
            type="text"
            value={option}
            onChange={(e) =>
              handleOptionChange(index, e.target.value)
            }
            placeholder={`Enter Option ${String.fromCharCode(
              65 + index
            )}`}
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
        </div>
      ))}

      {/* Correct Answer */}

      <div>
        <label className="block font-semibold mb-2">
          Correct Answer
        </label>

        <select
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
          className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
          required
        >
          <option value="">Select Correct Answer</option>

          {options.map((option, index) => (
            <option
              key={index}
              value={option}
              disabled={!option.trim()}
            >
              Option {String.fromCharCode(65 + index)}
            </option>
          ))}
        </select>
      </div>

      {/* Marks */}

      <div>
        <label className="block font-semibold mb-2">
          Marks
        </label>

        <input
          type="number"
          min="1"
          value={marks}
          onChange={(e) => setMarks(e.target.value)}
          className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
          required
        />
      </div>

      {/* Submit */}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Question"}
      </button>
    </form>
  );
}

export default QuestionForm;