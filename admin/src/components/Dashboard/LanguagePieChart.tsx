import React from 'react';
import { PieChart, Pie, Legend, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORSd = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']; // Define colors

const LanguagePieChart = ({ data }) => {
  return (
    <ResponsiveContainer height={300}>
      <PieChart>
        <Pie
          data={Object.values(data)}
          cx="50%"
          cy="50%"
          label
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={2}
          dataKey="count"
          stroke={null}
          strokeWidth={0}
        >
          {Object.values(data).map((entry, index) => (
            <Cell key={`cell-${index}`} style={{ outline: 'none' }} stroke="none" strokeWidth={0} fill={COLORSd[index]} />
          ))}
        </Pie>
        <Legend
          verticalAlign="bottom"
          align="center"
          wrapperStyle={{ paddingTop: '20px' }}
          iconSize={15}
          iconType="square"
          layout="horizontal"
          formatter={(value, entry) => <span style={{ color: entry.color }}>{value}</span>}
        />
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default LanguagePieChart;
