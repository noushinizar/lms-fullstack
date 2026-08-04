import { useEffect, useState } from "react";

function ReviewSubmissionForm({
  initialData,
  loading,
  onSubmit,
}) {

  const [marksObtained, setMarksObtained] = useState(0);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {

    if (initialData) {

      setMarksObtained(
        initialData.marksObtained || 0
      );

      setFeedback(
        initialData.feedback || ""
      );

    }

  }, [initialData]);

  const handleSubmit = (e) => {

    e.preventDefault();

    onSubmit({
      marksObtained,
      feedback,
    });

  };

  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >

      <div>

        <label className="block font-semibold mb-2">
          Marks Obtained
        </label>

        <input
          type="number"
          value={marksObtained}
          onChange={(e) =>
            setMarksObtained(e.target.value)
          }
          className="w-full border rounded-lg px-4 py-3"
          min="0"
          max="100"
          required
        />

      </div>

      <div>

        <label className="block font-semibold mb-2">
          Feedback
        </label>

        <textarea
          rows={6}
          value={feedback}
          onChange={(e) =>
            setFeedback(e.target.value)
          }
          className="w-full border rounded-lg px-4 py-3"
          placeholder="Write feedback for the student..."
        />

      </div>

      <button
        disabled={loading}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg"
      >
        {loading ? "Saving..." : "Save Review"}
      </button>

    </form>

  );

}

export default ReviewSubmissionForm;