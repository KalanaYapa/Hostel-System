import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, PieLabelRenderProps } from 'recharts';

// Food orders data by category
const foodOrdersData = [
  { name: 'Breakfast', value: 145, color: '#3b82f6' },
  { name: 'Lunch', value: 320, color: '#10b981' },
  { name: 'Dinner', value: 280, color: '#f59e0b' },
  { name: 'Snacks', value: 95, color: '#ef4444' },
  { name: 'Beverages', value: 160, color: '#8b5cf6' },
];

// Calculate total orders
const totalOrders = foodOrdersData.reduce((sum, item) => sum + item.value, 0);

// Custom label to show percentage
const renderCustomLabel = (props: PieLabelRenderProps) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  if (midAngle === undefined || percent === undefined) return null;

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      style={{ fontSize: '14px', fontWeight: 'bold' }}
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

const FoodOrdersPieChart = ({ isAnimationActive = true }) => (
  <div style={{ 
    backgroundColor: 'white',
    padding: '32px',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }}>
    <div style={{ marginBottom: '24px' }}>
      <h2 style={{ 
        fontSize: '18px', 
        fontWeight: '500', 
        color: '#333',
        marginBottom: '8px'
      }}>
        Food Orders by Category
      </h2>
      <p style={{ fontSize: '14px', color: '#666' }}>
        Total Orders: <span style={{ fontWeight: '600', color: '#333' }}>{totalOrders}</span>
      </p>
    </div>

    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={foodOrdersData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius="70%"
          labelLine={false}
          label={renderCustomLabel}
          isAnimationActive={isAnimationActive}
        >
          {foodOrdersData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white',
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          formatter={(value) => [`${value} orders`, 'Orders']}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

export default FoodOrdersPieChart;