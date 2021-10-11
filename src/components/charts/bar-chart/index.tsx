import { XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart as RechartsBarChart, Bar } from 'recharts'
import styled, { useTheme } from 'styled-components'
import { useEffect, useState } from 'react'
import { DateTime } from 'luxon'
import { commify } from '@ethersproject/units'
import { PairLiquidityMetric, TvlMetric } from '../../../constants/featured-campaigns/metrics'
import { ChartDataPoint } from '../../../constants/featured-campaigns/platforms'

const ChartContainer = styled.div`
  height: 300px;
`

interface BarChartProps {
  metric: TvlMetric | PairLiquidityMetric
}

export const BarChart = ({ metric }: BarChartProps) => {
  const theme = useTheme()

  const [chartData, setChartData] = useState<ChartDataPoint[]>([])

  useEffect(() => {
    let cancelled = false
    const fetchChartData = async () => {
      const data = await metric.chartData()
      if (!cancelled) setChartData(data)
    }
    fetchChartData()
    return () => {
      cancelled = false
    }
  }, [metric])

  return (
    <ChartContainer>
      {chartData.length > 0 && (
        <ResponsiveContainer>
          <RechartsBarChart barCategoryGap={1} data={chartData}>
            <XAxis
              tickLine={false}
              axisLine={false}
              interval="preserveEnd"
              minTickGap={80}
              tickFormatter={(tick) => DateTime.fromMillis(tick).toFormat('DD')}
              dataKey="x"
              tick={{ fill: theme.surfaceContent }}
              type={'number'}
              domain={['dataMin', 'dataMax']}
            />
            <YAxis type="number" axisLine={false} interval="preserveEnd" yAxisId={0} tick={false} />
            <Tooltip
              cursor={{ fill: theme.border }}
              formatter={(val: string) => `$${commify(val)}`}
              labelFormatter={(label) => DateTime.fromMillis(label).toFormat('DD')}
              labelStyle={{ paddingTop: 4 }}
              contentStyle={{
                padding: '8px 12px',
                borderRadius: 12,
                borderColor: theme.border,
                color: 'black',
              }}
            />
            <Bar type="monotone" dataKey="y" fill={theme.accent} yAxisId={0} stroke={theme.accent} />
          </RechartsBarChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  )
}
