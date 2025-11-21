import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Sample data for branch-wise attendance
const branchData = [
  {
    branch: 'Gunarathinan',
    Absent: 12,
    Present: 0,
  },
  {
    branch: 'Walawa',
    Absent: 12,
    Present: 0,
  },
  {
    branch: 'Mahaweli',
    Absent: 12,
    Present: 0,
  },
];

const AttendanceDashboard = () => {
  const totalStudents = 12;
  const presentToday = 0;
  const absentToday = 12;
  const overallAttendance = ((presentToday / totalStudents) * 100).toFixed(0);

  return (
    <div style={{ 
      padding: '40px', 
      backgroundColor: '#f5f5f5', 
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Overall Attendance Card */}
        <div style={{
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ 
            fontSize: '14px', 
            color: '#666', 
            marginBottom: '12px',
            fontWeight: '500'
          }}>
            Overall Attendance
          </div>
          <div style={{ 
            fontSize: '48px', 
            fontWeight: '300', 
            color: '#333',
            marginBottom: '8px'
          }}>
            {overallAttendance}%
          </div>
          <div style={{ fontSize: '13px', color: '#999' }}>
            {presentToday} / {totalStudents} students
          </div>
        </div>

        {/* Present Today Card */}
        <div style={{
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ 
            fontSize: '14px', 
            color: '#666', 
            marginBottom: '12px',
            fontWeight: '500'
          }}>
            Present Today
          </div>
          <div style={{ 
            fontSize: '48px', 
            fontWeight: '300', 
            color: '#10b981'
          }}>
            {presentToday}
          </div>
        </div>

        {/* Absent Today Card */}
        <div style={{
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ 
            fontSize: '14px', 
            color: '#666', 
            marginBottom: '12px',
            fontWeight: '500'
          }}>
            Absent Today
          </div>
          <div style={{ 
            fontSize: '48px', 
            fontWeight: '300', 
            color: '#ef4444'
          }}>
            {absentToday}
          </div>
        </div>
      </div>

      {/* Branch-wise Attendance Chart */}
      <div style={{
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: '500', 
          color: '#333',
          marginBottom: '24px'
        }}>
          Branch-wise Attendance
        </h2>
        
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={branchData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="branch" 
              tick={{ fill: '#666', fontSize: 12 }}
              axisLine={{ stroke: '#e5e5e5' }}
            />
            <YAxis 
              tick={{ fill: '#666', fontSize: 12 }}
              axisLine={{ stroke: '#e5e5e5' }}
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
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="square"
            />
            <Bar 
              dataKey="Absent" 
              fill="#ef4444" 
              radius={[8, 8, 0, 0]}
              barSize={60}
            />
            <Bar 
              dataKey="Present" 
              fill="#10b981" 
              radius={[8, 8, 0, 0]}
              barSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AttendanceDashboard;