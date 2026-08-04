import { useEffect, useState } from "react";

function CourseForm({
  mentors,
  onSubmit,
  initialData = null,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    thumbnail: "",
    mentor: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        category: initialData.category || "",
        price: initialData.price || "",
        thumbnail: initialData.thumbnail || "",
        mentor: initialData.mentor?._id || initialData.mentor || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit(formData);

    if (!initialData) {
      setFormData({
        title: "",
        description: "",
        category: "",
        price: "",
        thumbnail: "",
        mentor: "",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <input
        type="text"
        name="title"
        placeholder="Course Title"
        value={formData.title}
        onChange={handleChange}
        required
        className="w-full border rounded-lg p-3"
      />

      <textarea
        name="description"
        placeholder="Course Description"
        value={formData.description}
        onChange={handleChange}
        required
        rows={4}
        className="w-full border rounded-lg p-3"
      />

      <input
        type="text"
        name="category"
        placeholder="Category"
        value={formData.category}
        onChange={handleChange}
        required
        className="w-full border rounded-lg p-3"
      />

      <input
        type="number"
        name="price"
        placeholder="Price"
        value={formData.price}
        onChange={handleChange}
        required
        className="w-full border rounded-lg p-3"
      />

      <input
        type="text"
        name="thumbnail"
        placeholder="Thumbnail URL"
        value={formData.thumbnail}
        onChange={handleChange}
        className="w-full border rounded-lg p-3"
      />

      <select
        name="mentor"
        value={formData.mentor}
        onChange={handleChange}
        required
        className="w-full border rounded-lg p-3"
      >
        <option value="">Select Mentor</option>

        {mentors.map((mentor) => (
          <option key={mentor._id} value={mentor._id}>
            {mentor.name}
          </option>
        ))}
      </select>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700"
      >
        {loading
          ? "Saving..."
          : initialData
          ? "Update Course"
          : "Create Course"}
      </button>

    </form>
  );
}

export default CourseForm;