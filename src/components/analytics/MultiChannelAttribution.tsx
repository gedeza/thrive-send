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
        const data = await getConversionMetrics({
          start: dateRange.start.toISOString().split('T')[0],
          end: dateRange.end.toISOString().split('T')[0]
        });
        setAttributionData(data);
      } catch (_error) {
        console.error("", _error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [campaignId, dateRange]); // Only depend on actual data parameters

  if (loading) {
    return <div>Loading attribution data...</div>;
  }

  if (!attributionData) {
    return <div>No attribution data available</div>;
  }

  const renderAttributionModel = (model: string) => {
    if (!attributionData?.models?.[model]) {
      return <div>No data available for {model} attribution model</div>;
    }

    const data = attributionData.models[model];
    const channels = data.channels || [];
    const totalConversions = channels.reduce((sum: number, ch: any) => sum + (ch.conversions || 0), 0);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h4 className="text-lg font-semibold mb-4">Channel Contribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={channels.map((ch: any) => ({
                  name: ch.channel || ch.name,
                  value: ch.conversions || ch.value || 0
                }))}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {channels.map((entry: any, index: number) => (
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
            {channels.map((channel: any) => {
              const channelName = channel.channel || channel.name || 'Unknown';
              const conversions = channel.conversions || channel.value || 0;
              const revenue = channel.revenue || 0;
              
              return (
                <div key={channelName} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{channelName}</span>
                    <div className="text-sm text-gray-500 text-right">
                      <div>{conversions.toLocaleString()} conversions</div>
                      {revenue > 0 && <div>${revenue.toLocaleString()} revenue</div>}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${totalConversions > 0 ? (conversions / totalConversions) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
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
          <TabsTrigger value="lastClick">Last Click</TabsTrigger>
          <TabsTrigger value="firstClick">First Click</TabsTrigger>
          <TabsTrigger value="multiTouch">Multi-Touch</TabsTrigger>
        </TabsList>

        <TabsContent value="lastClick">
          {renderAttributionModel('lastClick')}
        </TabsContent>

        <TabsContent value="firstClick">
          {renderAttributionModel('firstClick')}
        </TabsContent>

        <TabsContent value="multiTouch">
          {renderAttributionModel('multiTouch')}
        </TabsContent>
      </Tabs>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Attribution Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total Conversions:</span>
            <span className="font-medium">{attributionData?.totalConversions?.toLocaleString() || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span>Conversion Rate:</span>
            <span className="font-medium">{attributionData?.conversionRate || 'N/A'}%</span>
          </div>
          <div className="flex justify-between">
            <span>Total Revenue:</span>
            <span className="font-medium">${attributionData?.revenue?.toLocaleString() || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span>Average Order Value:</span>
            <span className="font-medium">${attributionData?.averageOrderValue?.toFixed(2) || 'N/A'}</span>
          </div>
        </div>
      </div>
    </Card>
  );
} 