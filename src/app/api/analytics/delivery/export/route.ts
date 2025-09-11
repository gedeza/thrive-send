import { NextRequest, NextResponse } from 'next/server';
import { deliveryTracker } from '@/lib/email/delivery-tracker';
import { logger } from '@/lib/utils/logger';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const campaignId = searchParams.get('campaignId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const format = searchParams.get('format') as 'csv' | 'json' || 'csv';
    const includeMetadata = searchParams.get('includeMetadata') === 'true';

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    const options: RequestInit = { format, includeMetadata };
    if (campaignId) options.campaignId = campaignId;
    if (startDate) options.startDate = new Date(startDate);
    if (endDate) options.endDate = new Date(endDate);

    const exportData = await deliveryTracker.exportDeliveryData(organizationId, options);
    
    logger.info('Delivery data exported', {
      organizationId,
      campaignId,
      format,
      dataSize: exportData.length,
    });

    const contentType = format === 'json' ? 'application/json' : 'text/csv';
    const filename = `delivery-data-${organizationId}${campaignId ? `-${campaignId}` : ''}-${new Date().toISOString().split('T')[0]}.${format}`;

    return new NextResponse(exportData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (_error) {
    logger.error('Failed to export delivery data', error as Error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to export data',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}