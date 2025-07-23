import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAnalytics } from '@/lib/api/analytics-service';

interface ABTestAnalyticsProps {
  testId: string;
  dateRange: {
    start: Date;
    end: Date;
  };
}

export function ABTestAnalytics({ testId, dateRange }: ABTestAnalyticsProps) {
  const { getABTestResults } = useAnalytics();
  const [testResults, setTestResults] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchResults = async () => {
      try {
        const results = await getABTestResults(testId);
        setTestResults(results);
      } catch (error) {
        console.error('Error fetching A/B test results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [testId, dateRange]); // Only depend on actual data parameters

  if (loading) {
    return <div>Loading A/B test results...</div>;
  }

  if (!testResults) {
    return <div>No test results available</div>;
  }

  // Safe access helpers
  const variantAMetrics = testResults?.variantA?.metrics || [];
  const variantBMetrics = testResults?.variantB?.metrics || [];
  const timeSeriesData = testResults?.timeSeriesData || [];
  const timeline = testResults?.timeline || [];

  const calculateConfidence = (variantA: any, variantB: any) => {
    // Basic statistical significance calculation using sample proportions
    // In a real implementation, you would use proper statistical tests
    if (!variantA?.metrics || !variantB?.metrics) return 0;
    
    try {
      // Extract conversion rates (assuming they're percentages)
      const conversionA = variantA.metrics.find((m: any) => m.name === 'Conversion Rate');
      const conversionB = variantB.metrics.find((m: any) => m.name === 'Conversion Rate');
      
      if (!conversionA || !conversionB) return 0;
      
      // Simple confidence calculation based on difference
      const rateA = parseFloat(conversionA.value?.replace('%', '') || '0');
      const rateB = parseFloat(conversionB.value?.replace('%', '') || '0');
      const difference = Math.abs(rateA - rateB);
      
      // Basic confidence estimation (not statistically rigorous)
      if (difference > 5) return 99;
      if (difference > 2) return 95;
      if (difference > 1) return 90;
      if (difference > 0.5) return 85;
      return 70;
    } catch (error) {
      console.error('Error calculating confidence:', error);
      return 0;
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">A/B Test Results</h2>
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Variant A</h3>
              <div className="space-y-2">
                {variantAMetrics.length > 0 ? (
                  variantAMetrics.map((metric: any) => (
                    <div key={metric.name} className="flex justify-between">
                      <span>{metric.name}</span>
                      <span className="font-medium">{metric.value}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">No metrics available for Variant A</div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Variant B</h3>
              <div className="space-y-2">
                {variantBMetrics.length > 0 ? (
                  variantBMetrics.map((metric: any) => (
                    <div key={metric.name} className="flex justify-between">
                      <span>{metric.name}</span>
                      <span className="font-medium">{metric.value}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">No metrics available for Variant B</div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Test Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Winner:</span>
                <span className="font-medium">
                  {testResults?.winner === 'none' ? 'No clear winner' : `Variant ${testResults?.winner || 'TBD'}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Confidence Level:</span>
                <span className="font-medium">{testResults?.confidence || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span>Sample Size:</span>
                <span className="font-medium">{testResults?.sampleSize?.toLocaleString() || 'N/A'}</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="metrics">
          <div className="space-y-6">
            {timeSeriesData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['open_rate', 'click_rate', 'conversion_rate'].map((metric) => (
                  <Card key={metric} className="p-4">
                    <h4 className="text-lg font-semibold mb-4 capitalize">
                      {metric.replace('_', ' ')}
                    </h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey={`variantA_${metric}`}
                          stroke="#8884d8"
                          name="Variant A"
                        />
                        <Line
                          type="monotone"
                          dataKey={`variantB_${metric}`}
                          stroke="#82ca9d"
                          name="Variant B"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No time series data available for detailed metrics</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Timeline</h3>
            <div className="space-y-2">
              {timeline.length > 0 ? (
                timeline.map((event: any) => (
                  <div key={event.date} className="flex items-start gap-4">
                    <div className="w-24 text-sm text-gray-500">
                      {event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{event.title || 'Untitled Event'}</div>
                      <div className="text-sm text-gray-600">{event.description || 'No description available'}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No timeline events available</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
} 