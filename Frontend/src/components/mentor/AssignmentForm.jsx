import { useEffect, useState } from "react";

function AssignmentForm({
  initialData,
  loading,
  onSubmit,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState([""]);
  const [dueDate, setDueDate] = useState("");
  const [maxMarks, setMaxMarks] = useState(100);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");

      setRequirements(
        initialData.requirements?.length
          ? initialData.requirements
          : [""]
      );

      setDueDate(
        initialData.dueDate
          ? initialData.dueDate.substring(0, 10)
          : ""
      );

      setMaxMarks(initialData.maxMarks || 100);
    } else {
      setTitle("");
      setDescription("");
      setRequirements([""]);
      setDueDate("");
      setMaxMarks(100);
    }
  }, [initialData]);

  const handleRequirementChange = (index, value) => {
    const updated = [...requirements];
    updated[index] = value;
    setRequirements(updated);
  };

  const addRequirement = () => {
    setRequirements([...requirements, ""]);
  };

  const removeRequirement = (index) => {
    if (requirements.length === 1) return;

    setRequirements(
      requirements.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      title,
      description,
      requirements: requirements.filter(
        (item) => item.trim() !== ""
      ),
      dueDate,
      maxMarks,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Assignment Title */}

      <div>
        <label className="block font-semibold mb-2">
          Assignment Title
        </label>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="parctical task"
          className="w-full border rounded-lg px-4 py-3"
          required
        />
      </div>

      {/* Description */}

      <div>
        <label className="block font-semibold mb-2">
          Description
        </label>

        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the assignment..."
          className="w-full border rounded-lg px-4 py-3"
          required
        />
      </div>

      {/* Requirements */}

      <div>
        <label className="block font-semibold mb-2">
          Requirements
        </label>

        <p className="text-sm text-gray-500 mb-4">
          Add one requirement per field.
        </p>

        {requirements.map((requirement, index) => (
          <div
            key={index}
            className="flex gap-3 mb-3"
          >
            <div className="flex items-center justify-center text-xl">
              ✅
            </div>

            <input
              type="text"
              value={requirement}
              onChange={(e) =>
                handleRequirementChange(
                  index,
                  e.target.value
                )
              }
              placeholder={`Requirement ${index + 1}`}
              className="flex-1 border rounded-lg px-4 py-3"
            />

            <button
              type="button"
              onClick={() => removeRequirement(index)}
              disabled={requirements.length === 1}
              className={`px-4 rounded-lg text-white ${
                requirements.length === 1
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addRequirement}
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
        >
          + Add Requirement
        </button>
      </div>

      {/* Due Date & Marks */}

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="block font-semibold mb-2">
            Due Date
          </label>

          <input
            type="date"
            value={dueDate}
            onChange={(e) =>
              setDueDate(e.target.value)
            }
            className="w-full border rounded-lg px-4 py-3"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">
            Maximum Marks
          </label>

          <input
            type="number"
            value={maxMarks}
            onChange={(e) =>
              setMaxMarks(e.target.value)
            }
            className="w-full border rounded-lg px-4 py-3"
            min="1"
            required
          />
        </div>
      </div>

      {/* Submit */}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg transition"
      >
        {loading
          ? "Saving..."
          : initialData
            ? "Update Assignment"
            : "Create Assignment"}
      </button>
    </form>
  );
}

export default AssignmentForm;