import { useState, useEffect } from "react";

function QuizForm({
  initialData,
  loading,
  onSubmit,
}) {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [dueDate,setDueDate] = useState("");

  useEffect(() => {

    if (initialData) {

      setTitle(initialData.title);

      setDescription(initialData.description);

      setDuration(initialData.duration);
      setDueDate(initialData.dueDate);

    }

  }, [initialData]);

  const handleSubmit = (e) => {

    e.preventDefault();

    onSubmit({
      title,
      description,
      duration,
      dueDate,
    });

  };

  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >

      <input
        type="text"
        placeholder="Quiz Title"
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
        className="w-full border rounded-lg px-4 py-3"
        required
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) =>
          setDescription(e.target.value)
        }
        className="w-full border rounded-lg px-4 py-3"
      />

      <input
        type="number"
        placeholder="Duration (Minutes)"
        value={duration}
        onChange={(e) =>
          setDuration(e.target.value)
        }
        className="w-full border rounded-lg px-4 py-3"
      />
      <div>
  <label className="block font-medium mb-2">
    Due Date
  </label>

  <input
    type="date"
    name="dueDate"
    value={dueDate}
     onChange={(e) =>
          setDueDate(e.target.value)
        }
    className="w-full border rounded-lg p-3"
    required
  />
</div>
      <button
        disabled={loading}
        className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700"
      >
        {loading
          ? "Saving..."
          : "Save Quiz"}
      </button>

    </form>

  );

}

export default QuizForm;
