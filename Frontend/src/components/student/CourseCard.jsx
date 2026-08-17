import { Link } from "react-router-dom";

function CourseCard({ course }) {
  return (
    <div
      className="
        bg-white
        rounded-xl
        shadow-md
        overflow-hidden
        hover:shadow-xl
        hover:-translate-y-1
        transition-all
        duration-300
        flex
        flex-col
        h-full
      "
    >
      {/* Course Thumbnail */}

      <img
        src={course.thumbnail}
        alt={course.title}
        className="
          w-full
          h-48
          object-cover
          shrink-0
        "
      />

      {/* Course Content */}

      <div className="p-5 flex flex-col flex-1">

        {/* Title */}

        <h2
          className="
            text-xl
            font-bold
            mb-2
            text-gray-900
            line-clamp-2
            min-h-14
          "
          title={course.title}
        >
          {course.title}
        </h2>

        {/* Description */}

        <p
          className="
            text-gray-600
            mb-4
            leading-relaxed
            line-clamp-4
            min-h-24
          "
          title={course.description}
        >
          {course.description}
        </p>

        {/* Category */}

        <p
          className="
            text-sm
            text-gray-500
            mb-2
          "
        >
          <span className="font-medium text-gray-700">
            Category:
          </span>{" "}
          {course.category}
        </p>

        {/* Price */}

        <p
          className="
            text-amber-600
            font-bold
            text-lg
            mb-5
          "
        >
          ₹{course.price}
        </p>

        {/* Button */}

        <div className="mt-auto">

          <Link
            to={`/student/courses/${course._id}`}
            className="
              inline-flex
              items-center
              justify-center
              bg-amber-500
              hover:bg-amber-600
              active:bg-amber-700
              text-white
              font-medium
              px-5
              py-2.5
              rounded-lg
              shadow-sm
              hover:shadow-md
              transition-all
              duration-200
            "
          >
            View Details
          </Link>

        </div>

      </div>
    </div>
  );
}

export default CourseCard;