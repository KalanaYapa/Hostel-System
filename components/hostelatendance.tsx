import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

// Sample data for hostel attendance patterns
const dailyData = [
  { day: 'Mon', present: 245, absent: 15, lateEntry: 8, total: 260 },
  { day: 'Tue', present: 252, absent: 8, lateEntry: 5, total: 260 },
  { day: 'Wed', present: 248, absent: 12, lateEntry: 10, total: 260 },
  { day: 'Thu', present: 255, absent: 5, lateEntry: 3, total: 260 },
  { day: 'Fri', present: 238, absent: 22, lateEntry: 15, total: 260 },
  { day: 'Sat', present: 220, absent: 40, lateEntry: 12, total: 260 },
  { day: 'Sun', present: 215, absent: 45, lateEntry: 18, total: 260 },
];

const weeklyData = [
  { week: 'Week 1', present: 1685, absent: 135, lateEntry: 52, total: 1820 },
  { week: 'Week 2', present: 1720, absent: 100, lateEntry: 48, total: 1820 },
  { week: 'Week 3', present: 1695, absent: 125, lateEntry: 65, total: 1820 },
  { week: 'Week 4', present: 1710, absent: 110, lateEntry: 55, total: 1820 },
  { week: 'Week 5', present: 1650, absent: 170, lateEntry: 70, total: 1820 },
  { week: 'Week 6', present: 1730, absent: 90, lateEntry: 42, total: 1820 },
  { week: 'Week 7', present: 1700, absent: 120, lateEntry: 58, total: 1820 },
  { week: 'Week 8', present: 1715, absent: 105, lateEntry: 50, total: 1820 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: readonly any[]; label?: string | number }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-300 rounded shadow-lg">
        <p className="font-semibold text-gray-800 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
        <p className="text-sm text-gray-600 mt-2 pt-2 border-t">
          Attendance Rate: {((payload[0].value / payload[3].value) * 100).toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

const HostelAttendanceChart = () => {
  const [viewMode, setViewMode] = useState('daily');
  const data = viewMode === 'daily' ? dailyData : weeklyData;
  const xAxisKey = viewMode === 'daily' ? 'day' : 'week';

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Hostel Attendance & Monitoring
        </h2>
        <p className="text-gray-600 mb-4">
          Track resident presence patterns and identify attendance trends
        </p>
        
        {/* View Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'daily'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Daily View
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'weekly'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Weekly View
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey={xAxisKey} 
              stroke="#666"
              style={{ fontSize: '14px' }}
            />
            <YAxis 
              stroke="#666"
              style={{ fontSize: '14px' }}
            />
            <Tooltip content={CustomTooltip} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            <Line 
              type="monotone" 
              dataKey="present" 
              stroke="#10b981" 
              strokeWidth={3}
              name="Present"
              dot={{ fill: '#10b981', r: 5 }}
              activeDot={{ r: 7 }}
            />
            <Line 
              type="monotone" 
              dataKey="absent" 
              stroke="#ef4444" 
              strokeWidth={3}
              name="Absent"
              dot={{ fill: '#ef4444', r: 5 }}
              activeDot={{ r: 7 }}
            />
            <Line 
              type="monotone" 
              dataKey="lateEntry" 
              stroke="#f59e0b" 
              strokeWidth={3}
              name="Late Entry"
              dot={{ fill: '#f59e0b', r: 5 }}
              activeDot={{ r: 7 }}
            />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="#6366f1" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Total Capacity"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-green-100 p-4 rounded-lg">
          <p className="text-sm text-green-800 font-medium">Avg Present</p>
          <p className="text-2xl font-bold text-green-900">
            {viewMode === 'daily' 
              ? Math.round(dailyData.reduce((a, b) => a + b.present, 0) / dailyData.length)
              : Math.round(weeklyData.reduce((a, b) => a + b.present, 0) / weeklyData.length)
            }
          </p>
        </div>
        <div className="bg-red-100 p-4 rounded-lg">
          <p className="text-sm text-red-800 font-medium">Avg Absent</p>
          <p className="text-2xl font-bold text-red-900">
            {viewMode === 'daily' 
              ? Math.round(dailyData.reduce((a, b) => a + b.absent, 0) / dailyData.length)
              : Math.round(weeklyData.reduce((a, b) => a + b.absent, 0) / weeklyData.length)
            }
          </p>
        </div>
        <div className="bg-orange-100 p-4 rounded-lg">
          <p className="text-sm text-orange-800 font-medium">Avg Late Entry</p>
          <p className="text-2xl font-bold text-orange-900">
            {viewMode === 'daily' 
              ? Math.round(dailyData.reduce((a, b) => a + b.lateEntry, 0) / dailyData.length)
              : Math.round(weeklyData.reduce((a, b) => a + b.lateEntry, 0) / weeklyData.length)
            }
          </p>
        </div>
        <div className="bg-indigo-100 p-4 rounded-lg">
          <p className="text-sm text-indigo-800 font-medium">Attendance Rate</p>
          <p className="text-2xl font-bold text-indigo-900">
            {viewMode === 'daily' 
              ? ((dailyData.reduce((a, b) => a + b.present, 0) / dailyData.reduce((a, b) => a + b.total, 0)) * 100).toFixed(1)
              : ((weeklyData.reduce((a, b) => a + b.present, 0) / weeklyData.reduce((a, b) => a + b.total, 0)) * 100).toFixed(1)
            }%
          </p>
        </div>
      </div>
    </div>
  );
};

export default HostelAttendanceChart;