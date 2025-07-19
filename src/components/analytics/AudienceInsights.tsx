import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useAnalytics } from '@/lib/api/analytics-service';

interface AudienceInsightsProps {
  campaignId: string;
  dateRange: {
    start: Date;
    end: Date;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function AudienceInsights({ campaignId, dateRange }: AudienceInsightsProps) {
  const { getAudienceSegments } = useAnalytics();
  const [insightsData, setInsightsData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAudienceSegments(campaignId, dateRange);
        setInsightsData(data);
      } catch (error) {
        console.error('Error fetching audience insights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [campaignId, dateRange]); // Only depend on actual data parameters

  if (loading) {
    return <div>Loading audience insights...</div>;
  }

  if (!insightsData) {
    return <div>No audience insights available</div>;
  }

  const renderDemographics = () => {
    if (!insightsData?.demographics) {
      return <div>No demographic data available</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h4 className="text-lg font-semibold mb-4">Age Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={insightsData.demographics.ageRanges || []}
                dataKey="percentage"
                nameKey="range"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {(insightsData.demographics.ageRanges || []).map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h4 className="text-lg font-semibold mb-4">Regional Distribution</h4>
          <div className="space-y-4">
            {(insightsData.demographics.regions || []).map((region: any) => (
              <div key={region.region} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{region.region}</span>
                  <span className="text-sm text-gray-500">
                    {region.percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${region.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  const renderBehavioral = () => {
    if (!insightsData?.behavioral) {
      return <div>No behavioral data available</div>;
    }

    const timeSlotData = (insightsData.behavioral.timeSlots || []).map((slot: any) => ({
      time: slot.slot,
      opens: Math.floor(slot.percentage * 10),
      clicks: Math.floor(slot.percentage * 4)
    }));

    return (
      <div className="space-y-6">
        <Card className="p-4">
          <h4 className="text-lg font-semibold mb-4">Engagement by Time Slot</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeSlotData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="opens" fill="#8884d8" name="Opens" />
              <Bar dataKey="clicks" fill="#82ca9d" name="Clicks" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4">
            <h4 className="text-lg font-semibold mb-4">Device Usage</h4>
            <div className="space-y-4">
              {(insightsData.behavioral.devices || []).map((device: any) => (
                <div key={device.device} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{device.device}</span>
                    <span className="text-sm text-gray-500">
                      {device.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${device.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="text-lg font-semibold mb-4">Content Types</h4>
            <div className="space-y-4">
              {(insightsData.behavioral.contentTypes || []).map((content: any) => (
                <div key={content.type} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{content.type}</span>
                    <span className="text-sm text-gray-500">
                      {content.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${content.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Audience Insights</h2>
      
      <Tabs defaultValue="demographics">
        <TabsList>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="demographics">
          {renderDemographics()}
        </TabsContent>

        <TabsContent value="behavioral">
          {renderBehavioral()}
        </TabsContent>

        <TabsContent value="engagement">
          <div className="space-y-6">
            {insightsData?.engagement?.trends && (
              <Card className="p-4">
                <h4 className="text-lg font-semibold mb-4">Engagement Trends</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={insightsData.engagement.trends.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" name="Engagement Score" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4">
                <h4 className="text-lg font-semibold mb-4">Engagement Metrics</h4>
                <div className="space-y-4">
                  {(insightsData?.engagement?.metrics || []).map((metric: any) => (
                    <div key={metric.metric} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{metric.metric}</span>
                        <span className="text-sm text-gray-500">
                          {metric.total?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${metric.percentage || 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="text-lg font-semibold mb-4">Audience Segments</h4>
                <div className="space-y-4">
                  {(insightsData?.demographics?.segments || []).map((segment: any) => (
                    <div key={segment.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{segment.name}</span>
                        <span className="text-sm text-gray-500">
                          {segment.count?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${segment.percentage || 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Audience Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total Audience Size:</span>
            <span className="font-medium">{insightsData?.total?.toLocaleString() || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span>Average Engagement Score:</span>
            <span className="font-medium">{insightsData?.engagement?.score?.toFixed(1) || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span>Most Active Segment:</span>
            <span className="font-medium">{insightsData?.engagement?.mostActiveSegment || 'N/A'}</span>
          </div>
        </div>
      </div>
    </Card>
  );
} 