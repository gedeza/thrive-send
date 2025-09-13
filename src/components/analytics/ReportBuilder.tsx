import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, Trash2, Save, Download } from 'lucide-react';
import { useAnalytics } from '@/lib/api/analytics-service';
import { LineChart, BarChart, PieChart } from '@/components/charts';
import { MetricCard } from '@/components/ui/metric-card';
import { DataTable } from '@/components/ui/data-table';

interface ReportBuilderProps {
  campaignId: string;
  dateRange: {
    start: Date;
    end: Date;
  };
}

interface ReportSection {
  id: string;
  type: 'chart' | 'metric' | 'table';
  title: string;
  config: any;
}

// Component to render different section types
const ReportSectionRenderer = ({ section }: { section: ReportSection }) => {
  switch (section.type) {
    case 'metric':
      return (
        <MetricCard
          title={section.title}
          value={section.config.value}
          change={section.config.change}
        />
      );
    case 'chart':
      return (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">{section.title}</h3>
          {section.config.chartType === 'line' && (
            <LineChart
              data={section.config.data}
              height={300}
            />
          )}
          {section.config.chartType === 'bar' && (
            <BarChart
              data={section.config.data}
              height={300}
            />
          )}
          {section.config.chartType === 'pie' && (
            <PieChart
              data={section.config.data}
              height={300}
            />
          )}
        </Card>
      );
    case 'table':
      return (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">{section.title}</h3>
          <DataTable
            columns={section.config.columns.map((col: string) => ({
              header: col,
              accessorKey: col.toLowerCase(),
            }))}
            data={section.config.data.map((row: any[]) => ({
              [section.config.columns[0].toLowerCase()]: row[0],
              [section.config.columns[1].toLowerCase()]: row[1],
              [section.config.columns[2].toLowerCase()]: row[2],
            }))}
          />
        </Card>
      );
    default:
      return null;
  }
};

export function ReportBuilder({ campaignId, dateRange }: ReportBuilderProps) {
  const [sections, setSections] = useState<ReportSection[]>([]);
  const [activeTab, setActiveTab] = useState('builder');
  const analytics = useAnalytics();

  const availableComponents = [
    { id: 'line-chart', type: 'chart' as const, title: 'Line Chart' },
    { id: 'bar-chart', type: 'chart' as const, title: 'Bar Chart' },
    { id: 'pie-chart', type: 'chart' as const, title: 'Pie Chart' },
    { id: 'metric-card', type: 'metric' as const, title: 'Metric Card' },
    { id: 'data-table', type: 'table' as const, title: 'Data Table' },
  ];

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // Reordering within the same list
    if (source.droppableId === destination.droppableId) {
      const newSections = Array.from(sections);
      const [removed] = newSections.splice(source.index, 1);
      newSections.splice(destination.index, 0, removed);
      setSections(newSections);
    } 
    // Adding new component from available components
    else if (source.droppableId === 'available-components') {
      const component = availableComponents[source.index];
      const newSection: ReportSection = {
        id: `${component.id}-${Date.now()}`,
        type: component.type,
        title: component.title,
        config: getDefaultConfig(component.type)
      };
      
      const newSections = Array.from(sections);
      newSections.splice(destination.index, 0, newSection);
      setSections(newSections);
    }
  };

  const getDefaultConfig = (type: string) => {
    switch (type) {
      case 'metric':
        return {
          value: 0,
          change: '0%'
        };
      case 'chart':
        return {
          chartType: 'line',
          data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
              label: 'Value',
              data: [0, 0, 0, 0, 0, 0, 0]
            }]
          }
        };
      case 'table':
        return {
          columns: ['Column 1', 'Column 2', 'Column 3'],
          data: [
            ['Data 1', 'Data 2', 'Data 3'],
            ['Data 4', 'Data 5', 'Data 6']
          ]
        };
      default:
        return {};
    }
  };

  const removeSection = (index: number) => {
    const newSections = Array.from(sections);
    newSections.splice(index, 1);
    setSections(newSections);
  };

  const saveReport = async () => {
    try {
      const response = await fetch('/api/analytics/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Campaign Report',
          sections,
          campaignId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save report');
      }

      const data = await response.json();
      console.log('Report saved:', data);
    } catch (_error) {
      console.error("", _error);
    }
  };

  const exportReport = async (format: 'pdf' | 'csv' | 'excel') => {
    try {
      // TODO: Implement export functionality
      console.log('Exporting report as:', format);
    } catch (_error) {
      console.error("", _error);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Report Builder</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={saveReport}>
            <Save className="mr-2 h-4 w-4" />
            Save Report
          </Button>
          <Button variant="outline" onClick={() => exportReport('pdf')}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="builder">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-12 gap-6">
              {/* Available Components Sidebar */}
              <div className="col-span-3">
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Available Components</h3>
                  <Droppable droppableId="available-components">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2"
                      >
                        {availableComponents.map((component, index) => (
                          <Draggable
                            key={component.id}
                            draggableId={component.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="p-3 bg-muted/50 rounded-md cursor-move"
                              >
                                {component.title}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </Card>
              </div>

              {/* Report Canvas */}
              <div className="col-span-9">
                <Card className="p-4 min-h-[500px]">
                  <Droppable droppableId="report-canvas">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4"
                      >
                        {sections.map((section, index) => (
                          <Draggable
                            key={section.id}
                            draggableId={section.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="p-4 bg-white border rounded-lg"
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="font-medium">{section.title}</h4>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeSection(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="h-32">
                                  <ReportSectionRenderer section={section} />
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </Card>
              </div>
            </div>
          </DragDropContext>
        </TabsContent>

        <TabsContent value="preview">
          <Card className="p-6">
            <div className="space-y-6">
              {sections.map((section) => (
                <div key={section.id}>
                  <ReportSectionRenderer section={section} />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </Card>
  );
} 