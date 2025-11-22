"use client";
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    color: string;
    name: string;
    value: number;
  }>;
  label?: string;
}

// Sample data for fee collection trends (in LKR)
const generateMonthlyData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((month, index) => ({
    month,
    hostelRent: 15000 + Math.random() * 5000,
    messCharges: 8000 + Math.random() * 3000,
    securityDeposit: index % 3 === 0 ? 5000 + Math.random() * 2000 : 0,
    maintenanceFee: 2500 + Math.random() * 1000,
    totalCollection: 0
  })).map(item => ({
    ...item,
    totalCollection: item.hostelRent + item.messCharges + item.securityDeposit + item.maintenanceFee
  }));
};

const FinancialAnalytics = () => {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [data] = useState(generateMonthlyData());

  // Calculate summary statistics
  const totalRevenue = data.reduce((sum, item) => sum + item.totalCollection, 0);
  const avgMonthly = totalRevenue / data.length;
  const maxMonth = data.reduce((max, item) => item.totalCollection > max.totalCollection ? item : max);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800 mb-2">{label} {selectedYear}</p>
          {payload.map((entry: { color: string; name: string; value: number }, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="font-semibold">Rs. {entry.value.toLocaleString('en-LK', {maximumFractionDigits: 0})}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Financial Analytics Dashboard</h1>
          <p className="text-gray-600">Hostel Fee Collection Trends & Revenue Insights</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  Rs. {totalRevenue.toLocaleString('en-LK', {maximumFractionDigits: 0})}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg. Monthly Collection</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  Rs. {avgMonthly.toLocaleString('en-LK', {maximumFractionDigits: 0})}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Peak Collection Month</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {maxMonth.month} - Rs. {maxMonth.totalCollection.toLocaleString('en-LK', {maximumFractionDigits: 0})}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Fee Collection Trends</h2>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="month" 
                stroke="#666"
                style={{ fontSize: '14px' }}
              />
              <YAxis 
                stroke="#666"
                style={{ fontSize: '14px' }}
                tickFormatter={(value) => `Rs. ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="totalCollection" 
                stroke="#3b82f6" 
                strokeWidth={3}
                name="Total Collection"
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="hostelRent" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Hostel Rent"
                dot={{ fill: '#10b981', r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="messCharges" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Mess Charges"
                dot={{ fill: '#f59e0b', r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="maintenanceFee" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                name="Maintenance Fee"
                dot={{ fill: '#8b5cf6', r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="securityDeposit" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Security Deposit"
                dot={{ fill: '#ef4444', r: 3 }}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Fee Breakdown Legend */}
        <div className="mt-6 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Fee Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <div>
                <p className="text-sm font-medium text-gray-700">Hostel Rent</p>
                <p className="text-xs text-gray-500">Monthly accommodation fees</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-amber-500 rounded"></div>
              <div>
                <p className="text-sm font-medium text-gray-700">Mess Charges</p>
                <p className="text-xs text-gray-500">Dining & food services</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <div>
                <p className="text-sm font-medium text-gray-700">Maintenance Fee</p>
                <p className="text-xs text-gray-500">Facility upkeep charges</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <div>
                <p className="text-sm font-medium text-gray-700">Security Deposit</p>
                <p className="text-xs text-gray-500">One-time refundable deposit</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialAnalytics;