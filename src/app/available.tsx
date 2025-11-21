import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Interfaces
interface StatCardProps {
  title: string;
  value: number | string;
  color?: string;
  suffix?: string;
}

interface OccupancyData {
  branch: string;
  Occupied: number;
  Available: number;
}

interface OccupancyChartProps {
  data: OccupancyData[];
}

// Data
const occupancyData: OccupancyData[] = [
  { branch: 'Gunarathinan', Occupied: 1, Available: 10 },
  { branch: 'Walawa', Occupied: 1, Available: 10 },
  { branch: 'Mahaweli', Occupied: 1, Available: 10 },
];

// Reusable StatCard Component
const StatCard = ({ title, value, color = '#333', suffix = '' }: StatCardProps) => (
  <div className="stat-card">
    <div className="stat-title">{title}</div>
    <div className="stat-value" style={{ color }}>
      {value}{suffix}
    </div>
  </div>
);

// Chart Component
const OccupancyChart = ({ data }: OccupancyChartProps) => (
  <div className="chart-container">
    <h2 className="chart-title">Branch-wise Occupancy</h2>
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis 
          dataKey="branch" 
          tick={{ fill: '#666', fontSize: 12 }}
          axisLine={{ stroke: '#e5e5e5' }}
          tickLine={false}
        />
        <YAxis 
          tick={{ fill: '#666', fontSize: 12 }}
          axisLine={{ stroke: '#e5e5e5' }}
          tickLine={false}
          domain={[0, 12]}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white',
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        />
        <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="square" />
        <Bar dataKey="Available" fill="#10b981" radius={[8, 8, 0, 0]} barSize={80} />
        <Bar dataKey="Occupied" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={80} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// Main Dashboard Component
const RoomOccupancyDashboard = () => {
  const totalRooms = 5;
  const occupiedRooms = 1;
  const occupancyRate = ((occupiedRooms / totalRooms) * 100).toFixed(1);

  return (
    <>
      <style>{`
        .dashboard {
          padding: 40px;
          background-color: #f5f5f5;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }
        
        .stat-card {
          background-color: white;
          padding: 32px;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        
        .stat-title {
          font-size: 14px;
          color: #666;
          margin-bottom: 12px;
          font-weight: 500;
        }
        
        .stat-value {
          font-size: 48px;
          font-weight: 300;
        }
        
        .chart-container {
          background-color: white;
          padding: 32px;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        
        .chart-title {
          font-size: 18px;
          font-weight: 500;
          color: #333;
          margin-bottom: 24px;
          margin-top: 0;
        }
      `}</style>

      <div className="dashboard">
        <div className="stats-grid">
          <StatCard title="Total Rooms" value={totalRooms} />
          <StatCard title="Occupied" value={occupiedRooms} color="#3b82f6" />
          <StatCard title="Occupancy Rate" value={occupancyRate} suffix="%" />
        </div>

        <OccupancyChart data={occupancyData} />
      </div>
    </>
  );
};

export default RoomOccupancyDashboard;