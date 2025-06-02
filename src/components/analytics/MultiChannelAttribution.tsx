import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useAnalytics } from '@/lib/api/analytics-service';

interface MultiChannelAttributionProps {
  campaignId: string;
  dateRange: {
    start: Date;
    end: Date;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function MultiChannelAttribution({ campaignId, dateRange }: MultiChannelAttributionProps) {
  const { getConversionMetrics } = useAnalytics();
  const [attributionData, setAttributionData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getConversionMetrics(dateRange);
        setAttributionData(data);
      } catch (error) {
        console.error('Error fetching attribution data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [campaignId, dateRange, getConversionMetrics]);

  if (loading) {
    return <div>Loading attribution data...</div>;
  }

  if (!attributionData) {
    return <div>No attribution data available</div>;
  }

  const renderAttributionModel = (model: string) => {
    const data = attributionData.models[model];
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h4 className="text-lg font-semibold mb-4">Channel Contribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.channels}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {data.channels.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h4 className="text-lg font-semibold mb-4">Channel Performance</h4>
          <div className="space-y-4">
            {data.channels.map((channel: any) => (
              <div key={channel.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{channel.name}</span>
                  <span className="text-sm text-gray-500">
                    {channel.value.toLocaleString()} conversions
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(channel.value / data.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Multi-Channel Attribution</h2>
      
      <Tabs defaultValue="last_touch">
        <TabsList>
          <TabsTrigger value="last_touch">Last Touch</TabsTrigger>
          <TabsTrigger value="first_touch">First Touch</TabsTrigger>
          <TabsTrigger value="linear">Linear</TabsTrigger>
          <TabsTrigger value="time_decay">Time Decay</TabsTrigger>
        </TabsList>

        <TabsContent value="last_touch">
          {renderAttributionModel('last_touch')}
        </TabsContent>

        <TabsContent value="first_touch">
          {renderAttributionModel('first_touch')}
        </TabsContent>

        <TabsContent value="linear">
          {renderAttributionModel('linear')}
        </TabsContent>

        <TabsContent value="time_decay">
          {renderAttributionModel('time_decay')}
        </TabsContent>
      </Tabs>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Attribution Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total Conversions:</span>
            <span className="font-medium">{attributionData.total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Average Path Length:</span>
            <span className="font-medium">{attributionData.averagePathLength}</span>
          </div>
          <div className="flex justify-between">
            <span>Most Common Path:</span>
            <span className="font-medium">{attributionData.mostCommonPath}</span>
          </div>
        </div>
      </div>
    </Card>
  );
} 