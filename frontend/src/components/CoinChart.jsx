import React from 'react'
import {ResponsiveContainer, Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine} from 'recharts'

const CoinChart = ({coinChartData}) => {
  return (
    <ResponsiveContainer className="w-full" height="100%">
    <AreaChart data={coinChartData}
      margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
      <XAxis dataKey="name" />
      <YAxis />
      {/* <CartesianGrid strokeDasharray="3 3" /> */}
      {/* <Tooltip /> */}
      {/* <ReferenceLine x="Page C" stroke="green" label="Min PAGE" /> */}
      {/* <ReferenceLine y={4000} label="Max" stroke="red" strokeDasharray="3 3" /> */}
      {/* <Area type="monotone" dataKey="uv" stroke="#8884d8" fill="#8884d8" /> */}
      <Area  dataKey="price" stroke="#8884d8" fill="#8884d8" />
    </AreaChart>
  </ResponsiveContainer>
  )
}

export default CoinChart