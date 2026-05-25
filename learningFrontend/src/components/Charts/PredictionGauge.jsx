import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

export default function PredictionGauge({ probability, size = 200 }) {
  const percentage = Math.round((probability || 0) * 100);
  const isGood = percentage >= 70;
  const isMedium = percentage >= 40 && percentage < 70;

  const color = isGood ? '#10b981' : isMedium ? '#f59e0b' : '#ef4444';
  const bgColor = isGood ? '#10b98120' : isMedium ? '#f59e0b20' : '#ef444420';
  const label = isGood ? 'High' : isMedium ? 'Medium' : 'Low';

  const data = [{ name: 'probability', value: percentage, fill: color }];

  return (
    <div className="flex flex-col items-center">
      <div style={{ width: size, height: size }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="75%"
            outerRadius="100%"
            barSize={12}
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar
              background={{ fill: bgColor }}
              clockWise
              dataKey="value"
              cornerRadius={10}
              angleAxisId={0}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{percentage}%</span>
          <span className="text-xs text-surface-400 font-medium">{label}</span>
        </div>
      </div>
      <p className="mt-2 text-sm text-surface-300">Placement Probability</p>
    </div>
  );
}
