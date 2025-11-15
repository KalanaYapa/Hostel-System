import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

// Sample data for complaint status
const complaintStatusData = [
  { name: 'Pending', value: 28, color: '#ef4444' },
  { name: 'In Progress', value: 45, color: '#f59e0b' },
  { name: 'Resolved', value: 127, color: '#10b981' },
];

// Sample data for complaint categories
const complaintCategoryData = [
  { name: 'Plumbing', value: 42, color: '#3b82f6' },
  { name: 'Electrical', value: 38, color: '#8b5cf6' },
  { name: 'Furniture', value: 31, color: '#ec4899' },
  { name: 'Cleaning', value: 45, color: '#14b8a6' },
  { name: 'AC/Heating', value: 24, color: '#f97316' },
  { name: 'Internet/WiFi', value: 20, color: '#6366f1' },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const total = payload[0].payload.total || 200;
    const percentage = ((data.value / total) * 100).toFixed(1);

    return (
      <div className="bg-white p-4 border-2 rounded-lg shadow-xl" style={{ borderColor: data.payload.color }}>
        <p className="font-bold text-gray-800 mb-1">{data.name}</p>
        <p className="text-lg font-semibold" style={{ color: data.payload.color }}>
          {data.value} complaints
        </p>
        <p className="text-sm text-gray-600">{percentage}% of total</p>
      </div>
    );
  }
  return null;
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  if (midAngle === undefined || innerRadius === undefined || outerRadius === undefined || percent === undefined) return null;

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't show label for small slices

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="font-semibold text-sm"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const HostelComplaintsPieChart = () => {
  const [activeView, setActiveView] = useState('status');
  
  const statusTotal = complaintStatusData.reduce((sum, item) => sum + item.value, 0);
  const categoryTotal = complaintCategoryData.reduce((sum, item) => sum + item.value, 0);
  
  const dataWithTotal = activeView === 'status' 
    ? complaintStatusData.map(item => ({ ...item, total: statusTotal }))
    : complaintCategoryData.map(item => ({ ...item, total: categoryTotal }));

  const currentData = activeView === 'status' ? complaintStatusData : complaintCategoryData;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Maintenance & Complaints Dashboard
        </h2>
        <p className="text-gray-600 mb-4">
          Track and manage hostel maintenance requests and complaint resolution
        </p>
        
        {/* View Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveView('status')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeView === 'status'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            By Status
          </button>
          <button
            onClick={() => setActiveView('category')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeView === 'category'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            By Category
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {activeView === 'status' ? 'Complaint Status Breakdown' : 'Complaint Categories'}
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={dataWithTotal}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {currentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend and Details */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Details</h3>
          <div className="space-y-3">
            {currentData.map((item, index) => {
              const total = activeView === 'status' ? statusTotal : categoryTotal;
              const percentage = ((item.value / total) * 100).toFixed(1);
              
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-gray-700">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{item.value}</p>
                    <p className="text-sm text-gray-500">{percentage}%</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total Summary */}
          <div className="mt-6 pt-4 border-t-2 border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-800">Total Complaints</span>
              <span className="text-2xl font-bold text-purple-600">
                {activeView === 'status' ? statusTotal : categoryTotal}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Status-specific metrics */}
      {activeView === 'status' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gradient-to-br from-red-100 to-red-200 p-5 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-800 font-medium mb-1">Pending</p>
                <p className="text-3xl font-bold text-red-900">{complaintStatusData[0].value}</p>
                <p className="text-xs text-red-700 mt-1">Requires immediate attention</p>
              </div>
              <div className="text-5xl opacity-20">⏳</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-5 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-800 font-medium mb-1">In Progress</p>
                <p className="text-3xl font-bold text-orange-900">{complaintStatusData[1].value}</p>
                <p className="text-xs text-orange-700 mt-1">Currently being worked on</p>
              </div>
              <div className="text-5xl opacity-20">🔧</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-100 to-green-200 p-5 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-800 font-medium mb-1">Resolved</p>
                <p className="text-3xl font-bold text-green-900">{complaintStatusData[2].value}</p>
                <p className="text-xs text-green-700 mt-1">Successfully completed</p>
              </div>
              <div className="text-5xl opacity-20">✅</div>
            </div>
          </div>
        </div>
      )}

      {/* Category-specific insights */}
      {activeView === 'category' && (
        <div className="mt-6 bg-white p-5 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Category Insights</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded">
              <p className="text-sm text-gray-600">Most Common</p>
              <p className="text-lg font-bold text-blue-600">Cleaning</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded">
              <p className="text-sm text-gray-600">Avg. Resolution Time</p>
              <p className="text-lg font-bold text-purple-600">2.3 days</p>
            </div>
            <div className="text-center p-3 bg-pink-50 rounded">
              <p className="text-sm text-gray-600">Priority Issues</p>
              <p className="text-lg font-bold text-pink-600">Electrical</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostelComplaintsPieChart;