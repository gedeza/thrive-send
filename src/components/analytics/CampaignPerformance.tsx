import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useAnalytics } from '@/lib/api/analytics-service';

interface CampaignPerformanceProps {
  campaignId: string;
  dateRange: {
    start: Date;
    end: Date;
  };
}

export function CampaignPerformance({ campaignId, dateRange }: CampaignPerformanceProps) {
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const analytics = useAnalytics();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const metrics = await analytics.getCampaignMetrics(campaignId, {
          start: dateRange.start.toISOString(),
          end: dateRange.end.toISOString(),
        });
        setPerformanceData(metrics[0]); // Assuming we're getting the first campaign's data
      } catch (_error) {
        console.error("", _error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [campaignId, dateRange]);

  if (loading) {
    return <div>Loading performance data...</div>;
  }

  if (!performanceData) {
    return <div>No performance data available</div>;
  }

  // Safe access helpers
  const metrics = performanceData?.metrics || [];
  const timeSeriesData = performanceData?.timeSeriesData?.datasets?.[0]?.data || [];

  return (
    <Card className="p-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
          <TabsTrigger value="roi">ROI</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.length > 0 ? (
              metrics.map((metric: any) => (
                <Card key={metric.title} className="p-4">
                  <h3 className="text-sm font-medium text-gray-500">{metric.title || 'Unknown Metric'}</h3>
                  <p className="text-2xl font-bold mt-1">{metric.value || 'N/A'}</p>
                  {metric.percentChange !== undefined && (
                    <div className="flex items-center mt-2">
                      <span className={`text-sm ${metric.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.percentChange >= 0 ? '↑' : '↓'} {Math.abs(metric.percentChange)}%
                      </span>
                      <span className="text-sm text-gray-500 ml-2">vs previous period</span>
                    </div>
                  )}
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                <p>No performance metrics available</p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Performance Trends</h3>
            <div className="h-[300px]">
              {timeSeriesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>No performance trend data available</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Engagement Rate Over Time</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="engagement"
                      stroke="#10B981"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Engagement by Channel</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData.timeSeriesData.datasets[0].data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channel" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="engagement" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Conversions Tab */}
        <TabsContent value="conversions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Conversion Funnel</h3>
              <div className="space-y-4">
                {['Impressions', 'Clicks', 'Conversions'].map((stage, index) => (
                  <div key={stage} className="flex items-center justify-between">
                    <span className="font-medium">{stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">
                        {performanceData.metrics.find((m: any) => m.title === stage)?.value || 0}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({((index + 1) * 33.33).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Conversion Rate Trend</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="conversionRate"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ROI Tab */}
        <TabsContent value="roi" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">ROI Metrics</h3>
              <div className="space-y-4">
                {['Investment', 'Revenue', 'ROI'].map((metric) => (
                  <div key={metric} className="flex items-center justify-between">
                    <span className="font-medium">{metric}</span>
                    <span className="text-lg font-bold">
                      {metric === 'ROI' ? (
                        `${performanceData.metrics.find((m: any) => m.title === metric)?.value || 0}%`
                      ) : (
                        `$${performanceData.metrics.find((m: any) => m.title === metric)?.value || 0}`
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">ROI Trend</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="roi"
                      stroke="#F97316"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
} 