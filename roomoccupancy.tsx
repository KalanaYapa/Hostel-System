import { BarChart, Legend, XAxis, YAxis, CartesianGrid, Tooltip, Bar } from 'recharts';

// Branch occupancy data
const data = [
  {
    name: 'Gunarathinan',
    Available: 10,
    Occupied: 1,
  },
  {
    name: 'Walawa',
    Available: 10,
    Occupied: 1,
  },
  {
    name: 'Mahaweli',
    Available: 10,
    Occupied: 1,
  },
];

const BranchOccupancyChart = ({ isAnimationActive = true }) => (
  <BarChart 
    style={{ 
      width: '100%', 
      maxWidth: '900px', 
      maxHeight: '70vh', 
      aspectRatio: 1.618 
    }} 
    responsive 
    data={data}
  >
    <CartesianGrid strokeDasharray="3 3" vertical={false} />
    <XAxis dataKey="name" />
    <YAxis width="auto" domain={[0, 12]} />
    <Tooltip />
    <Legend />
    <Bar 
      dataKey="Available" 
      fill="#10b981" 
      isAnimationActive={isAnimationActive}
      radius={[8, 8, 0, 0]}
    />
    <Bar 
      dataKey="Occupied" 
      fill="#3b82f6" 
      isAnimationActive={isAnimationActive}
      radius={[8, 8, 0, 0]}
    />
  </BarChart>
);

export default BranchOccupancyChart;