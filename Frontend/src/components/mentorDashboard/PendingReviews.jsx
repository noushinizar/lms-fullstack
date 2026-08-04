import { ClipboardCheck } from "lucide-react";
import { Link } from "react-router-dom";

function PendingReviews({ submissions }) {

  return (

    <div className="bg-white rounded-2xl shadow-md p-6">

      <div className="flex justify-between mb-6">

        <h2 className="text-2xl font-bold">
          Pending Reviews
        </h2>

        <ClipboardCheck className="text-orange-500"/>

      </div>

      <div className="space-y-4">

        {submissions.length === 0 ? (

          <p className="text-gray-500 text-center py-10">
            No pending reviews 🎉
          </p>

        ) : (

          submissions.map((item) => (

            <Link
              key={item._id}
              to={`/mentor/assignments/${item.assignmentId._id}/submissions`}
              className="block border rounded-xl p-4 hover:bg-orange-50"
            >

              <h3 className="font-semibold">
                {item.studentId.name}
              </h3>

              <p className="text-gray-600">
                {item.assignmentId.title}
              </p>

              <span className="text-xs text-red-500 font-semibold">
                Pending Review
              </span>

            </Link>

          ))

        )}

      </div>

    </div>

  );

}

export default PendingReviews;