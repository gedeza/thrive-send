"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine, Brush } from "recharts"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Download } from "lucide-react"

interface ChartData {
  date: string
  value: number
}

interface AnalyticsChartProps {
  data: ChartData[]
  title: string
  value: string
  description?: string
}

export function AnalyticsChart({ data, title, value, description }: AnalyticsChartProps) {
  const [timeRange, setTimeRange] = useState<'1d' | '7d' | '30d'>('7d')
  const [brushStartIndex, setBrushStartIndex] = useState(0)
  const [brushEndIndex, setBrushEndIndex] = useState(data.length - 1)

  const handleBrushChange = (newDomain: any) => {
    setBrushStartIndex(newDomain.startIndex)
    setBrushEndIndex(newDomain.endIndex)
  }

  // Filter data based on selected time range
  const filteredData = data.filter((item) => {
    const date = new Date(item.date)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    switch (timeRange) {
      case '1d':
        return diffDays <= 1
      case '7d':
        return diffDays <= 7
      case '30d':
        return diffDays <= 30
      default:
        return true
    }
  })

  const averageValue = filteredData.reduce((acc, curr) => acc + curr.value, 0) / filteredData.length

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          {description && (
            <CardDescription>
              {description}
            </CardDescription>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={timeRange === '1d' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setTimeRange('1d')}
          >
            1D
          </Button>
          <Button
            variant={timeRange === '7d' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setTimeRange('7d')}
          >
            7D
          </Button>
          <Button
            variant={timeRange === '30d' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setTimeRange('30d')}
          >
            30D
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  color: 'hsl(var(--card-foreground))'
                }}
                labelStyle={{ color: 'hsl(var(--card-foreground))' }}
              />
              <ReferenceLine y={averageValue} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorValue)"
              />
              <Brush
                dataKey="date"
                height={30}
                stroke="hsl(var(--primary))"
                onChange={handleBrushChange}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 