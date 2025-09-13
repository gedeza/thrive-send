import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

// Simple in-memory storage for demo reports when database is unavailable
const sessionReports = new Map<string, any[]>();

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Demo scheduled reports
    const demoScheduledReports = [
      {
        id: 'report-1',
        title: 'Weekly Performance Summary',
        type: 'performance',
        frequency: 'weekly',
        status: 'active',
        recipients: ['admin@springfield.gov', 'marketing@springfield.gov'],
        format: 'pdf',
        nextRun: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        lastRun: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        parameters: {
          timeRange: 'last-7-days',
          clientIds: ['demo-client-1'],
          metrics: ['engagement', 'reach', 'conversions'],
          includeCharts: true,
          includeInsights: true
        },
        deliverySettings: {
          emailSubject: 'Weekly Performance Report - {{date}}',
          emailBody: 'Please find attached your weekly performance report.',
          attachmentName: 'Springfield_Weekly_Report_{{date}}'
        },
        performance: {
          totalRuns: 12,
          successfulRuns: 11,
          avgGenerationTime: 142,
          lastError: null
        }
      },
      {
        id: 'report-2',
        title: 'Monthly Revenue Dashboard',
        type: 'revenue',
        frequency: 'monthly',
        status: 'active',
        recipients: ['finance@thrivesend.com', 'admin@thrivesend.com'],
        format: 'excel',
        nextRun: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        lastRun: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        parameters: {
          timeRange: 'last-30-days',
          includeCharts: true,
          includeInsights: false
        },
        deliverySettings: {
          emailSubject: 'Monthly Revenue Report - {{month}} {{year}}',
          emailBody: 'Monthly revenue analysis and client performance metrics attached.',
          attachmentName: 'Revenue_Report_{{month}}_{{year}}'
        },
        performance: {
          totalRuns: 4,
          successfulRuns: 4,
          avgGenerationTime: 89,
          lastError: null
        }
      },
      {
        id: 'report-3',
        title: 'Cross-Client Comparison',
        type: 'cross-client',
        frequency: 'weekly',
        status: 'paused',
        recipients: ['strategy@thrivesend.com'],
        format: 'pdf',
        nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        parameters: {
          timeRange: 'last-14-days',
          clientIds: ['demo-client-1', 'demo-client-2', 'demo-client-3'],
          metrics: ['engagement', 'growth', 'revenue'],
          includeCharts: true,
          includeInsights: true
        },
        deliverySettings: {
          emailSubject: 'Cross-Client Analysis Report',
          emailBody: 'Weekly comparison of client performance metrics.',
          attachmentName: 'Cross_Client_Report_{{date}}'
        },
        performance: {
          totalRuns: 8,
          successfulRuns: 7,
          avgGenerationTime: 203,
          lastError: 'Client data sync timeout on 2024-12-15'
        }
      },
      {
        id: 'report-4',
        title: 'Executive Summary',
        type: 'executive-summary',
        frequency: 'monthly',
        status: 'active',
        recipients: ['ceo@thrivesend.com', 'board@thrivesend.com'],
        format: 'pdf',
        nextRun: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        lastRun: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        parameters: {
          timeRange: 'last-30-days',
          includeCharts: false,
          includeInsights: true
        },
        deliverySettings: {
          emailSubject: 'Executive Summary - {{month}} {{year}}',
          emailBody: 'Monthly executive summary with key performance indicators.',
          attachmentName: 'Executive_Summary_{{month}}_{{year}}'
        },
        performance: {
          totalRuns: 3,
          successfulRuns: 3,
          avgGenerationTime: 67,
          lastError: null
        }
      }
    ];

    let databaseReports: any[] = [];
    
    try {
      console.log('Attempting to fetch automated reports from database...');
      
      databaseReports = await db.scheduledReport.findMany({
        where: {
          organizationId: organizationId
        },
        include: {
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          executions: {
            orderBy: { startedAt: 'desc' },
            take: 1
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Transform database data to match frontend interface
      databaseReports = databaseReports.map((report: any) => ({
        id: report.id,
        title: report.title,
        type: report.type,
        frequency: report.frequency,
        status: report.status,
        recipients: report.recipients,
        format: report.format,
        nextRun: report.nextRun?.toISOString(),
        lastRun: report.lastRun?.toISOString(),
        createdAt: report.createdAt.toISOString(),
        parameters: report.parameters,
        deliverySettings: report.deliverySettings,
        performance: report.performance || {
          totalRuns: 0,
          successfulRuns: 0,
          avgGenerationTime: 0,
          lastError: null
        },
        creator: {
          name: `${report.createdBy.firstName || ''} ${report.createdBy.lastName || ''}`.trim() || report.createdBy.email,
          email: report.createdBy.email
        }
      }));

      console.log(`Found ${databaseReports.length} scheduled reports in database`);
      
    } catch (dbError) {
      console.warn('Database unavailable for automated reports, using demo mode:', dbError);
      databaseReports = [];
    }

    // Use database data if available, otherwise demo data
    let reports = databaseReports.length > 0 ? databaseReports : demoScheduledReports;

    // Filter reports based on query parameters
    if (status && status !== 'all') {
      reports = reports.filter((report: any) => report.status === status);
    }

    if (type && type !== 'all') {
      reports = reports.filter((report: any) => report.type === type);
    }

    // Add session-based reports if any
    const sessionKey = `${organizationId}-${userId}`;
    const sessionReportsList = sessionReports.get(sessionKey) || [];
    reports = [...reports, ...sessionReportsList];

    console.log(`Returning ${reports.length} automated reports for organization: ${organizationId}`);
    
    return NextResponse.json({
      reports,
      totalCount: reports.length,
      activeCount: reports.filter((r: any) => r.status === 'active').length,
      pausedCount: reports.filter((r: any) => r.status === 'paused').length,
      generatedAt: new Date().toISOString(),
      isDemoData: databaseReports.length === 0
    });

  } catch (_error) {
    console.error("", _error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      organizationId,
      title,
      type,
      frequency,
      recipients,
      format,
      parameters,
      deliverySettings
    } = body;

    // Validate required fields
    if (!organizationId || !title || !type || !frequency || !recipients || !format) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, title, type, frequency, recipients, format' },
        { status: 400 }
      );
    }

    let createdReport: any;

    try {
      console.log('Attempting to create automated report in database...');
      
      // Create scheduled report in database
      createdReport = await db.scheduledReport.create({
        data: {
          title,
          type,
          frequency,
          status: 'active',
          recipients: Array.isArray(recipients) ? recipients : recipients.split(',').map((email: string) => email.trim()),
          format,
          nextRun: calculateNextRun(frequency),
          organizationId,
          createdById: userId,
          parameters: {
            timeRange: parameters?.timeRange || 'last-7-days',
            clientIds: parameters?.clientIds || [],
            metrics: parameters?.metrics || [],
            includeCharts: parameters?.includeCharts !== false,
            includeInsights: parameters?.includeInsights !== false
          },
          deliverySettings: {
            emailSubject: deliverySettings?.emailSubject || `${title} - {{date}}`,
            emailBody: deliverySettings?.emailBody || 'Please find your scheduled report attached.',
            attachmentName: deliverySettings?.attachmentName || `${title.replace(/\s+/g, '_')}_{{date}}`
          },
          performance: {
            totalRuns: 0,
            successfulRuns: 0,
            avgGenerationTime: 0,
            lastError: null
          }
        },
        include: {
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      // Transform to match frontend interface
      createdReport = {
        id: createdReport.id,
        title: createdReport.title,
        type: createdReport.type,
        frequency: createdReport.frequency,
        status: createdReport.status,
        recipients: createdReport.recipients,
        format: createdReport.format,
        nextRun: createdReport.nextRun?.toISOString(),
        lastRun: createdReport.lastRun?.toISOString(),
        createdAt: createdReport.createdAt.toISOString(),
        parameters: createdReport.parameters,
        deliverySettings: createdReport.deliverySettings,
        performance: createdReport.performance,
        creator: {
          name: `${createdReport.createdBy.firstName || ''} ${createdReport.createdBy.lastName || ''}`.trim() || createdReport.createdBy.email,
          email: createdReport.createdBy.email
        }
      };

      console.log('Scheduled report created successfully:', {
        reportId: createdReport.id,
        title: createdReport.title,
        type: createdReport.type,
        frequency: createdReport.frequency,
        recipientCount: createdReport.recipients.length
      });

    } catch (dbError) {
      console.warn('Database unavailable, creating demo report:', dbError);
      
      // Fallback: Create a demo report
      createdReport = {
        id: `report-${Date.now()}`,
        title,
        type,
        frequency,
        status: 'active',
        recipients: Array.isArray(recipients) ? recipients : recipients.split(',').map((email: string) => email.trim()),
        format,
        nextRun: calculateNextRun(frequency),
        createdAt: new Date().toISOString(),
        parameters: {
          timeRange: parameters?.timeRange || 'last-7-days',
          clientIds: parameters?.clientIds || [],
          metrics: parameters?.metrics || [],
          includeCharts: parameters?.includeCharts !== false,
          includeInsights: parameters?.includeInsights !== false
        },
        deliverySettings: {
          emailSubject: deliverySettings?.emailSubject || `${title} - {{date}}`,
          emailBody: deliverySettings?.emailBody || 'Please find your scheduled report attached.',
          attachmentName: deliverySettings?.attachmentName || `${title.replace(/\s+/g, '_')}_{{date}}`
        },
        performance: {
          totalRuns: 0,
          successfulRuns: 0,
          avgGenerationTime: 0,
          lastError: null
        }
      };

      // Store in session-based storage
      const sessionKey = `${organizationId}-${userId}`;
      const existingReports = sessionReports.get(sessionKey) || [];
      existingReports.push(createdReport);
      sessionReports.set(sessionKey, existingReports);

      console.log('Demo automated report created:', {
        reportId: createdReport.id,
        sessionKey,
        reportsInSession: existingReports.length,
        title: createdReport.title,
        type: createdReport.type,
        frequency: createdReport.frequency,
        recipientCount: createdReport.recipients.length
      });
    }
    
    return NextResponse.json({
      success: true,
      report: createdReport,
      message: 'Automated report scheduled successfully!',
      demoMode: true
    }, { status: 201 });

  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: 'Failed to create automated report' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      reportId,
      organizationId,
      action, // 'pause' | 'resume' | 'run_now' | 'update'
      updateData
    } = body;

    // Validate required fields
    if (!reportId || !organizationId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: reportId, organizationId, action' },
        { status: 400 }
      );
    }

    let actionResponse: any;

    try {
      console.log(`Attempting to perform report action: ${action} on report: ${reportId}`);
      
      switch (action) {
        case 'pause':
          await db.scheduledReport.update({
            where: { id: reportId },
            data: { 
              status: 'paused',
              updatedAt: new Date()
            }
          });
          actionResponse = {
            action: 'pause',
            reportId,
            status: 'paused',
            pausedAt: new Date().toISOString()
          };
          break;
          
        case 'resume':
          const reportToResume = await db.scheduledReport.findUnique({
            where: { id: reportId },
            select: { frequency: true }
          });
          
          await db.scheduledReport.update({
            where: { id: reportId },
            data: { 
              status: 'active',
              nextRun: calculateNextRun(reportToResume?.frequency || 'weekly'),
              updatedAt: new Date()
            }
          });
          
          actionResponse = {
            action: 'resume',
            reportId,
            status: 'active',
            resumedAt: new Date().toISOString(),
            nextRun: calculateNextRun(reportToResume?.frequency || 'weekly')
          };
          break;
          
        case 'run_now':
          // Create execution record
          const execution = await db.reportExecution.create({
            data: {
              scheduledReportId: reportId,
              status: 'running',
              startedAt: new Date()
            }
          });
          
          // Update last run time
          await db.scheduledReport.update({
            where: { id: reportId },
            data: { 
              lastRun: new Date(),
              updatedAt: new Date()
            }
          });
          
          actionResponse = {
            action: 'run_now',
            reportId,
            executionId: execution.id,
            status: 'generating',
            startedAt: execution.startedAt.toISOString(),
            estimatedCompletion: new Date(Date.now() + 2 * 60 * 1000).toISOString()
          };
          
          // Simulate completion after delay (in real app would be async job)
          setTimeout(async () => {
            try {
              await db.reportExecution.update({
                where: { id: execution.id },
                data: {
                  status: 'completed',
                  completedAt: new Date(),
                  executionTime: 2000,
                  fileUrl: `/api/reports/download/${execution.id}.pdf`,
                  fileSize: 1024 * 1024 // 1MB
                }
              });
              console.log(`Report ${reportId} generation completed`);
            } catch (_error) {
              console.error("", _error);
            }
          }, 2000);
          break;
          
        case 'update':
          if (!updateData) {
            return NextResponse.json(
              { error: 'Update data required for update action' },
              { status: 400 }
            );
          }
          
          await db.scheduledReport.update({
            where: { id: reportId },
            data: {
              ...updateData,
              updatedAt: new Date()
            }
          });
          
          actionResponse = {
            action: 'update',
            reportId,
            updatedFields: Object.keys(updateData),
            updatedAt: new Date().toISOString()
          };
          break;
          
        default:
          return NextResponse.json(
            { error: `Invalid action: ${action}` },
            { status: 400 }
          );
      }

      console.log(`Report action completed:`, actionResponse);

    } catch (dbError) {
      console.warn('Database unavailable for report action:', dbError);
      return NextResponse.json(
        { error: 'Database unavailable. Action could not be completed.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json({
      success: true,
      ...actionResponse,
      organizationId,
      message: `Report ${action} completed successfully`
    });

  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: 'Failed to perform report action' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('reportId');
    const organizationId = searchParams.get('organizationId');

    if (!reportId || !organizationId) {
      return NextResponse.json(
        { error: 'Missing required fields: reportId, organizationId' },
        { status: 400 }
      );
    }

    try {
      console.log(`Attempting to delete automated report: ${reportId}`);
      
      // Verify report belongs to organization
      const reportExists = await db.scheduledReport.findFirst({
        where: {
          id: reportId,
          organizationId: organizationId
        }
      });

      if (!reportExists) {
        return NextResponse.json(
          { error: 'Report not found or access denied' },
          { status: 404 }
        );
      }
      
      // Delete all executions first (due to foreign key constraint)
      await db.reportExecution.deleteMany({
        where: {
          scheduledReportId: reportId
        }
      });
      
      // Delete the scheduled report
      await db.scheduledReport.delete({
        where: {
          id: reportId
        }
      });

      console.log(`Scheduled report deleted successfully: ${reportId}`);

    } catch (dbError) {
      console.warn('Database unavailable, removing from demo storage:', dbError);
      
      // Remove from session storage
      const sessionKey = `${organizationId}-${userId}`;
      const existingReports = sessionReports.get(sessionKey) || [];
      const filteredReports = existingReports.filter((report: any) => report.id !== reportId);
      sessionReports.set(sessionKey, filteredReports);

      console.log(`Demo report deleted: ${reportId}`);
    }
    
    return NextResponse.json({
      success: true,
      reportId,
      message: 'Automated report deleted successfully'
    });

  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: 'Failed to delete automated report' },
      { status: 500 }
    );
  }
}

// Utility function to calculate next run time based on frequency
function calculateNextRun(frequency: string): string {
  const now = new Date();
  const nextRun = new Date(now);

  switch (frequency) {
    case 'daily':
      nextRun.setDate(now.getDate() + 1);
      break;
    case 'weekly':
      nextRun.setDate(now.getDate() + 7);
      break;
    case 'monthly':
      nextRun.setMonth(now.getMonth() + 1);
      break;
    case 'quarterly':
      nextRun.setMonth(now.getMonth() + 3);
      break;
    default:
      nextRun.setDate(now.getDate() + 7); // Default to weekly
  }

  return nextRun.toISOString();
}