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
  }, [campaignId, dateRange, getAudienceSegments]);

  if (loading) {
    return <div>Loading audience insights...</div>;
  }

  if (!insightsData) {
    return <div>No audience insights available</div>;
  }

  const renderDemographics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-4">
        <h4 className="text-lg font-semibold mb-4">Age Distribution</h4>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={insightsData.demographics.age}
              dataKey="value"
              nameKey="range"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {insightsData.demographics.age.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4">
        <h4 className="text-lg font-semibold mb-4">Geographic Distribution</h4>
        <div className="space-y-4">
          {insightsData.demographics.geography.map((region: any) => (
            <div key={region.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{region.name}</span>
                <span className="text-sm text-gray-500">
                  {region.value.toLocaleString()} users
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(region.value / insightsData.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderBehavioral = () => (
    <div className="space-y-6">
      <Card className="p-4">
        <h4 className="text-lg font-semibold mb-4">Engagement Patterns</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={insightsData.behavioral.engagement}>
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
            {insightsData.behavioral.devices.map((device: any) => (
              <div key={device.type} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{device.type}</span>
                  <span className="text-sm text-gray-500">
                    {device.value.toLocaleString()} users
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(device.value / insightsData.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h4 className="text-lg font-semibold mb-4">Content Preferences</h4>
          <div className="space-y-4">
            {insightsData.behavioral.contentPreferences.map((pref: any) => (
              <div key={pref.type} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{pref.type}</span>
                  <span className="text-sm text-gray-500">
                    {pref.value.toLocaleString()} interactions
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(pref.value / insightsData.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

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
            <Card className="p-4">
              <h4 className="text-lg font-semibold mb-4">Engagement Score Distribution</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={insightsData.engagement.scores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="score" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#8884d8" name="Users" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4">
                <h4 className="text-lg font-semibold mb-4">Engagement Metrics</h4>
                <div className="space-y-4">
                  {insightsData.engagement.metrics.map((metric: any) => (
                    <div key={metric.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{metric.name}</span>
                        <span className="text-sm text-gray-500">
                          {metric.value.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${metric.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="text-lg font-semibold mb-4">Engagement Trends</h4>
                <div className="space-y-4">
                  {insightsData.engagement.trends.map((trend: any) => (
                    <div key={trend.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{trend.name}</span>
                        <span className={`text-sm ${trend.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {trend.change >= 0 ? '+' : ''}{trend.change}%
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">{trend.description}</div>
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
            <span className="font-medium">{insightsData.total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Average Engagement Score:</span>
            <span className="font-medium">{insightsData.averageEngagementScore}</span>
          </div>
          <div className="flex justify-between">
            <span>Most Active Segment:</span>
            <span className="font-medium">{insightsData.mostActiveSegment}</span>
          </div>
        </div>
      </div>
    </Card>
  );
} 