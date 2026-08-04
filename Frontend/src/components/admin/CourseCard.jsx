function CourseCard({
  course,
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">

      {/* Thumbnail */}
      <img
        src={
          course.thumbnail ||
          "https://via.placeholder.com/600x300?text=No+Image"
        }
        alt={course.title}
        className="w-full h-48 object-cover"
      />

      {/* Content */}
      <div className="p-5">

        <h2 className="text-xl font-bold mb-2">
          {course.title}
        </h2>

        <p className="text-gray-600 mb-3 line-clamp-2">
          {course.description}
        </p>

        <div className="space-y-2">

          <p>
            <span className="font-semibold">
              Category:
            </span>{" "}
            {course.category}
          </p>

          <p>
            <span className="font-semibold">
              Mentor:
            </span>{" "}
            {course.mentor?.name}
          </p>

          <p className="text-green-700 font-bold text-lg">
            ₹ {course.price}
          </p>

        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-5">

          <button
            onClick={() => onEdit(course)}
            className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600"
          >
            Edit
          </button>

          <button
            onClick={() => onDelete(course)}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
          >
            Delete
          </button>

        </div>

      </div>

    </div>
  );
}

export default CourseCard;