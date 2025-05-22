import { NextResponse } from 'next/server';
import { subDays, format } from 'date-fns';

// Mock data generator
function generateMockData(days: number, platform?: string) {
  const data = [];
  const platforms = platform ? [platform] : ['facebook', 'twitter', 'instagram', 'linkedin'];

  for (let i = 0; i < days; i++) {
    const date = subDays(new Date(), i);
    platforms.forEach((p) => {
      data.push({
        contentId: `${p}-${i}`,
        platform: p,
        metrics: {
          views: Math.floor(Math.random() * 1000) + 100,
          engagement: {
            likes: Math.floor(Math.random() * 100) + 10,
            shares: Math.floor(Math.random() * 50) + 5,
            comments: Math.floor(Math.random() * 25) + 2,
          },
          reach: Math.floor(Math.random() * 2000) + 200,
          clicks: Math.floor(Math.random() * 150) + 15,
          timestamp: format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        },
      });
    });
  }

  return data;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const timeRange = searchParams.get('timeRange') || '7d';
  const platform = searchParams.get('platform') || 'all';

  // Convert timeRange to days
  const days = parseInt(timeRange.replace('d', ''));
  const platformFilter = platform === 'all' ? undefined : platform;

  // Generate mock data
  const data = generateMockData(days, platformFilter);

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return NextResponse.json(data);
} 