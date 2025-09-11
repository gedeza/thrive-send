import { NextRequest, NextResponse } from 'next/server';
import { analyticsBroadcaster } from '@/lib/websocket/analytics-broadcaster';
import { ContentAnalytics } from '@/lib/api/content-analytics-service';

interface TriggerUpdateRequest {
  contentId: string;
  field: keyof ContentAnalytics;
  increment?: number;
  organizationId?: string;
  clientId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TriggerUpdateRequest = await request.json();
    
    const { contentId, field, increment = 1, organizationId, clientId } = body;

    // Validate required fields
    if (!contentId || !field) {
      return NextResponse.json(
        { error: 'contentId and field are required' },
        { status: 400 }
      );
    }

    // Validate field is a valid analytics field
    const validFields: Array<keyof ContentAnalytics> = ['views', 'likes', 'shares', 'comments'];
    if (!validFields.includes(field)) {
      return NextResponse.json(
        { error: `Invalid field. Must be one of: ${validFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Trigger real-time update
    await analyticsBroadcaster.triggerRealUpdate(
      contentId,
      field,
      increment,
      organizationId,
      clientId
    );

    return NextResponse.json({
      success: true,
      message: `Analytics update triggered: ${field} +${increment} for content ${contentId}`,
      data: {
        contentId,
        field,
        increment,
        timestamp: Date.now()
      }
    });

  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: 'Failed to trigger analytics update' },
      { status: 500 }
    );
  }
}

// GET endpoint to check broadcaster status
export async function GET() {
  try {
    const status = analyticsBroadcaster.getSimulationStatus();
    
    return NextResponse.json({
      success: true,
      status: {
        simulationRunning: status.isRunning,
        connectedClients: status.connectedClients,
        timestamp: Date.now()
      }
    });

  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: 'Failed to get broadcaster status' },
      { status: 500 }
    );
  }
}