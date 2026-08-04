import { useEffect, useState } from "react";

import StudentLayout from "../../layouts/StudentLayout";
import CourseCard from "../../components/student/CourseCard";

import { getCourses } from "../../services/courseService";

function MyCourses() {

  const [courses, setCourses] = useState([]);

  useEffect(() => {

    const fetchCourses = async () => {

      try {

        const data = await getCourses();

        setCourses(data);

      } catch (error) {

        console.log(error);

      }

    };

    fetchCourses();

  }, []);

  return (

    <StudentLayout>

      <h1 className="text-3xl font-bold mb-6">
        Available Courses
      </h1>

      <div
        className="
        grid
        grid-cols-1
        md:grid-cols-2
        lg:grid-cols-3
        gap-6
        "
      >

        {courses.map((course) => (

          <CourseCard
            key={course._id}
            course={course}
          />

        ))}

      </div>

    </StudentLayout>

  );

}

export default MyCourses;