import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";

function LearningChart({ progress = 0 }) {
  const data = [
    {
      name: "Progress",
      value: progress,
      fill: "#f59e0b",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 h-full">
      <h2 className="text-2xl font-bold mb-6">
        Learning Progress
      </h2>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            data={data}
            innerRadius="70%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
          >
            {/* Set value range from 0-100 */}
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />

            <RadialBar
              background
              clockWise
              dataKey="value"
              cornerRadius={15}
            />

            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-gray-800 text-3xl font-bold"
            >
              {progress}%
            </text>
          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-center text-gray-500">
        Average Course Progress
      </p>
    </div>
  );
}

export default LearningChart;


















