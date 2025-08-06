#!/usr/bin/env ts-node

import { getAnalyticsWebSocketServer, closeAnalyticsWebSocketServer } from '@/lib/websocket/analytics-websocket-server';
import { AnalyticsBroadcaster } from '@/lib/websocket/analytics-broadcaster';

async function startAnalyticsWebSocketServer() {
  try {
    console.log('🚀 Starting Analytics WebSocket Server...');
    
    // Initialize WebSocket server
    const wsServer = getAnalyticsWebSocketServer();
    console.log('✅ Analytics WebSocket Server started successfully');

    // Initialize broadcaster for development simulation
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Starting analytics simulation for development...');
      const broadcaster = AnalyticsBroadcaster.getInstance();
      
      // Wait a bit for server to fully initialize
      setTimeout(() => {
        broadcaster.startSimulation(10000); // 10-second intervals
        console.log('✅ Analytics simulation started');
      }, 2000);
    }

    // Graceful shutdown handling
    const shutdown = async () => {
      console.log('\n🛑 Shutting down Analytics WebSocket Server...');
      
      if (process.env.NODE_ENV === 'development') {
        const broadcaster = AnalyticsBroadcaster.getInstance();
        broadcaster.shutdown();
      }
      
      await closeAnalyticsWebSocketServer();
      console.log('✅ Analytics WebSocket Server shut down gracefully');
      process.exit(0);
    };

    // Handle shutdown signals
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    
    // Keep the process running
    console.log('📡 Analytics WebSocket Server is running...');
    console.log('   - WebSocket endpoint: ws://localhost:3001/analytics');
    console.log('   - Press Ctrl+C to stop');
    
    // Status check interval
    setInterval(() => {
      const status = AnalyticsBroadcaster.getInstance().getSimulationStatus();
      console.log(`📊 Status: ${status.connectedClients} clients connected, simulation: ${status.isRunning ? 'running' : 'stopped'}`);
    }, 30000); // Log status every 30 seconds

  } catch (error) {
    console.error('❌ Failed to start Analytics WebSocket Server:', error);
    process.exit(1);
  }
}

// Start the server
startAnalyticsWebSocketServer();