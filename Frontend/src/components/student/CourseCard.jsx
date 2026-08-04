

import { Link } from "react-router-dom";

function CourseCard({ course }) {

  return (

    <div
      className="
      bg-white
      rounded-xl
      shadow-md
      overflow-hidden
      hover:shadow-lg
      transition
      "
    >

      <img
        src={course.thumbnail}
        alt={course.title}
        className="w-full h-48 object-cover"
      />

      <div className="p-5">

        <h2
          className="
          text-xl
          font-bold
          mb-2
          "
        >
          {course.title}
        </h2>

        <p
          className="
          text-gray-600
          mb-3
          "
        >
          {course.description}
        </p>

        <p
          className="
          text-sm
          text-gray-500
          mb-2
          "
        >
          Category: {course.category}
        </p>

        <p
          className="
          text-green-600
          font-bold
          text-lg
          mb-4
          "
        >
          ₹{course.price}
        </p>

        <Link
          to={`/student/courses/${course._id}`}
          className="
          bg-blue-600
          text-white
          px-4
          py-2
          rounded
          "
        >
          View Details
        </Link>

      </div>

    </div>

  );

}

export default CourseCard;


