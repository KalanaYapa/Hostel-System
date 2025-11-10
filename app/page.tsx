"use client";

import React from 'react';
import { BarChart, Legend, XAxis, YAxis, CartesianGrid, Tooltip, Bar, ResponsiveContainer, TooltipContentProps } from 'recharts';

// Sample data for hostel management system
const data = [
  {
    block: 'Block A',
    totalBeds: 120,
    occupiedBeds: 115,
    vacantBeds: 5,
    occupancyRate: 95.8
  },
  {
    block: 'Block B',
    totalBeds: 150,
    occupiedBeds: 142,
    vacantBeds: 8,
    occupancyRate: 94.7
  },
  {
    block: 'Block C',
    totalBeds: 100,
    occupiedBeds: 88,
    vacantBeds: 12,
    occupancyRate: 88.0
  },
  {
    block: 'Block D',
    totalBeds: 130,
    occupiedBeds: 125,
    vacantBeds: 5,
    occupancyRate: 96.2
  },
  {
    block: 'Block E - Girls',
    totalBeds: 110,
    occupiedBeds: 98,
    vacantBeds: 12,
    occupancyRate: 89.1
  },
  {
    block: 'Block F - Boys',
    totalBeds: 140,
    occupiedBeds: 136,
    vacantBeds: 4,
    occupancyRate: 97.1
  },
  {
    block: 'Floor 1',
    totalBeds: 80,
    occupiedBeds: 75,
    vacantBeds: 5,
    occupancyRate: 93.8
  },
  {
    block: 'Floor 2',
    totalBeds: 80,
    occupiedBeds: 78,
    vacantBeds: 2,
    occupancyRate: 97.5
  }
];

// Custom tooltip to show detailed information
const CustomTooltip = ({ active, payload }: TooltipContentProps<any, any>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '12px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        <p style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
          {data.block}
        </p>
        <p style={{ color: '#4CAF50', margin: '4px 0' }}>
          Occupied: {data.occupiedBeds} beds
        </p>
        <p style={{ color: '#FF9800', margin: '4px 0' }}>
          Vacant: {data.vacantBeds} beds
        </p>
        <p style={{ color: '#2196F3', margin: '4px 0' }}>
          Total Capacity: {data.totalBeds} beds
        </p>
        <p style={{ color: '#9C27B0', margin: '4px 0', fontWeight: 'bold' }}>
          Occupancy Rate: {data.occupancyRate}%
        </p>
      </div>
    );
  }
  return null;
};

const HostelOccupancyChart = ({ isAnimationActive = true }) => {
  return (
    <div style={{ width: '100%', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '12px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '24px' }}>
          Room Occupancy by Hostel Block/Floor
        </h2>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          Current occupancy status across all hostel blocks
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <BarChart 
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="block" 
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            label={{ value: 'Number of Beds', angle: -90, position: 'insideLeft' }}
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={CustomTooltip} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="square"
          />
          <Bar 
            dataKey="occupiedBeds" 
            fill="#4CAF50" 
            name="Occupied Beds"
            isAnimationActive={isAnimationActive}
            radius={[8, 8, 0, 0]}
          />
          <Bar 
            dataKey="vacantBeds" 
            fill="#FF9800" 
            name="Vacant Beds"
            isAnimationActive={isAnimationActive}
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px', 
        marginTop: '24px' 
      }}>
        <div style={{ 
          padding: '16px', 
          backgroundColor: 'white', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
            Total Capacity
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>
            {data.reduce((sum, item) => sum + item.totalBeds, 0)} beds
          </div>
        </div>
        
        <div style={{ 
          padding: '16px', 
          backgroundColor: 'white', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
            Currently Occupied
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>
            {data.reduce((sum, item) => sum + item.occupiedBeds, 0)} beds
          </div>
        </div>
        
        <div style={{ 
          padding: '16px', 
          backgroundColor: 'white', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
            Available Beds
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>
            {data.reduce((sum, item) => sum + item.vacantBeds, 0)} beds
          </div>
        </div>
        
        <div style={{ 
          padding: '16px', 
          backgroundColor: 'white', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
            Overall Occupancy
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9C27B0' }}>
            {((data.reduce((sum, item) => sum + item.occupiedBeds, 0) / 
               data.reduce((sum, item) => sum + item.totalBeds, 0)) * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostelOccupancyChart;
