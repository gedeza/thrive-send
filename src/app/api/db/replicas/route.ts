import { NextRequest, NextResponse } from 'next/server';
import { getReadReplicaManager } from '@/lib/db/index';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const replicaManager = getReadReplicaManager();
    
    // Get replica status and statistics
    const replicaStatus = replicaManager.getReplicaStatus();
    const connectionStats = replicaManager.getConnectionStats();
    
    const response = {
      timestamp: new Date().toISOString(),
      status: replicaStatus,
      statistics: connectionStats,
    };
    
    logger.info('Database replicas status retrieved', {
      totalReplicas: replicaStatus.summary.totalReplicas,
      healthyReplicas: replicaStatus.summary.healthyReplicas,
      replicaUsage: connectionStats.replicaUsagePercentage,
    });
    
    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
    
  } catch (_error) {
    logger.error('Failed to retrieve replica status', error as Error);
    
    return NextResponse.json(
      {
        error: 'Failed to retrieve replica status',
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    
    const replicaManager = getReadReplicaManager();
    let result: any;
    let message: string;
    
    switch (action) {
      case 'force_health_check':
        await replicaManager.forceHealthCheck();
        result = { success: true };
        message = 'Health check forced on all replicas';
        break;
        
      case 'add_replica':
        const { replicaConfig } = body;
        if (!replicaConfig) {
          return NextResponse.json(
            { error: 'Replica configuration is required' },
            { status: 400 }
          );
        }
        
        const addResult = await replicaManager.addReplica(replicaConfig);
        result = { success: addResult };
        message = addResult 
          ? `Replica ${replicaConfig.id} added successfully`
          : `Failed to add replica ${replicaConfig.id}`;
        break;
        
      case 'remove_replica':
        const { replicaId } = body;
        if (!replicaId) {
          return NextResponse.json(
            { error: 'Replica ID is required' },
            { status: 400 }
          );
        }
        
        const removeResult = await replicaManager.removeReplica(replicaId);
        result = { success: removeResult };
        message = removeResult
          ? `Replica ${replicaId} removed successfully`
          : `Failed to remove replica ${replicaId}`;
        break;
        
      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
    
    const response = {
      success: result.success,
      action,
      message,
      timestamp: new Date().toISOString(),
      result,
    };
    
    logger.info('Replica action performed', {
      action,
      success: result.success,
      message,
    });
    
    return NextResponse.json(response, {
      status: result.success ? 200 : 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
  } catch (_error) {
    logger.error('Replica action failed', error as Error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Replica action failed',
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}