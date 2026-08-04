import { useEffect, useState } from "react";
import { getCourseStudents } from "../../services/enrollmentService";
import LoadingSpinner from "../common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";

function StudentsTab({ courseId }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, [courseId]);

  const fetchStudents = async () => {
    try {
      const data = await getCourseStudents(courseId);
      setStudents(data);
      
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
  return <LoadingSpinner />;
}

  if (students.length === 0) {
    return (
     <EmptyState
  icon="👥"
  title="No Students Enrolled"
  description="Students will appear here once they enroll."
/>
    );
  }

  return (
    <div className="space-y-4">

      {students.map((item) => (

        <div
          key={item.student._id}
          className=" rounded-xl p-5 shadow-sm bg-amber-200"
        >

          <h3 className="text-lg font-semibold">
            {item.student.name}
          </h3>

          <p>{item.student.email}</p>

          <p>{item.student.phone || "No phone"}</p>

          <p>
            Joined:
            {" "}
            {new Date(item.purchaseDate).toLocaleDateString()}
          </p>

          <div className="mt-4">

            <div className="flex justify-between mb-1">

              <span>Progress</span>

              <span>{item.progress}%</span>

            </div>

            <div className="w-full bg-gray-200 rounded-full h-3">

              <div
                className="bg-amber-600 h-3 rounded-full"
                style={{
                  width: `${item.progress}%`,
                }}
              />

            </div>

          </div>

        </div>

      ))}

    </div>
  );
}

export default StudentsTab;