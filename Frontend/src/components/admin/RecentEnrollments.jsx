function RecentEnrollments({ enrollments }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-6">Recent Enrollments</h2>

      {enrollments.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No Students Enrolled"
          description="Students will appear here once they enroll."
        />
      ) : (
        enrollments.map((item) => (
          <div key={item._id} className="bg-amber-200  rounded-xl  p-4 m-2">
            <h3 className="font-semibold">{item.studentId?.name}</h3>

            <p className="text-gray-600">{item.courseId?.title}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default RecentEnrollments;
