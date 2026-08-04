import { useState, useEffect } from "react";

function LessonForm({
  initialData = null,
  onSubmit,
  loading,
}) {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {

    if (initialData) {

      setTitle(initialData.title);

      setDescription(initialData.description);

      setVideoUrl(initialData.videoUrl);

    }

  }, [initialData]);

  const handleSubmit = (e) => {

    e.preventDefault();

    onSubmit({
      title,
      description,
      videoUrl,
    });

  };

  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >

      <div>

        <label className="block font-semibold mb-2">
          Lesson Title
        </label>

        <input
          type="text"
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
          className="w-full border rounded-lg px-4 py-3"
          required
        />

      </div>

      <div>

        <label className="block font-semibold mb-2">
          Description
        </label>

        <textarea
          rows="4"
          value={description}
          onChange={(e)=>setDescription(e.target.value)}
          className="w-full border rounded-lg px-4 py-3"
          required
        />

      </div>

      <div>

        <label className="block font-semibold mb-2">
          YouTube Video URL
        </label>

        <input
          type="text"
          value={videoUrl}
          onChange={(e)=>setVideoUrl(e.target.value)}
          className="w-full border rounded-lg px-4 py-3"
          required
        />

      </div>

      <button
        disabled={loading}
        className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700"
      >

        {loading
          ? "Saving..."
          : initialData
            ? "Update Lesson"
            : "Create Lesson"}

      </button>

    </form>

  );

}

export default LessonForm;