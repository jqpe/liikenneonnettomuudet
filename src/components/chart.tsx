import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import type { DataEntry } from '@/service'
import { palette } from '@/theme'
import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

const chartConfig = {
  JK: {
    label: palette.pedestrian.description,
    color: palette.pedestrian.value,
  },
  MA: {
    label: palette.car.description.split(' ')[0],
    color: palette.car.value,
  },
  PP: {
    label: palette.bicycle.description,
    color: palette.bicycle.value,
  },
  MP: {
    label: palette.motorcycle.description.split(' ')[0],
    color: palette.motorcycle.value,
  },
} satisfies ChartConfig

export function Chart({ data }: { data?: DataEntry[] }) {
  const aggregatedData = useMemo(() => {
    const counts = { JK: 0, PP: 0, MP: 0, MA: 0 }
    data?.forEach(item => {
      counts[item.kind as keyof typeof counts]++
    })
    return Object.entries(counts).map(([kind, count]) => ({
      kind,
      count,
      fill: `var(--color-${kind})`,
    }))
  }, [data])

  return (
    <>
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <BarChart dataKey="kind" accessibilityLayer data={aggregatedData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="count"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <ChartTooltip content={<ChartTooltipContent nameKey="kind" />} />
          <Bar dataKey="count" radius={4} />
        </BarChart>
      </ChartContainer>
      <ul className="flex flex-wrap gap-2">
        {(Object.keys(palette) as Array<keyof typeof palette>).map(key => (
          <li key={key} className="flex gap-2 text-xs items-center">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ background: palette[key].value }}
            />
            <p>{palette[key].description}</p>
          </li>
        ))}
      </ul>
    </>
  )
}
