import Assignment from "../../models/Assignment.js";
import AssignmentSubmission from "../../models/AssignmentSubmission.js";

export const calculateAssignmentProgress = async (
  studentId,
  courseId
) => {

  const assignments = await Assignment.find({
    courseId,
  }).select("_id");

  const assignmentIds = assignments.map(
    (a) => a._id
  );

  const totalAssignments =
    assignmentIds.length;

  const assignmentsCompleted =
    await AssignmentSubmission.countDocuments({
      studentId,
      assignmentId: {
        $in: assignmentIds,
      },
    });

  return {
    totalAssignments,
    assignmentsCompleted,
  };
};