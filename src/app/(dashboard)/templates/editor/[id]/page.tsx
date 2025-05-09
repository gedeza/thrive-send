"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { templates as mockTemplates, Template } from '../../templates.mock-data';
import { ArrowLeft, Save, Eye, Copy, Layout, Image, Type, Button as ButtonIcon, Plus, Trash } from 'lucide-react';

const componentTemplates = [
  {
    id: 'header-template',
    type: 'header',
    label: 'Header',
    icon: <Type size={16} />,
    content: '<h2 style="color: #4f46e5; padding: 15px 0;">New Section Header</h2>'
  },
  {
    id: 'text-template',
    type: 'text',
    label: 'Text Block',
    icon: <Type size={16} />,
    content: '<p style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">Add your text content here. This is a paragraph that you can edit.</p>'
  },
  {
    id: 'image-template',
    type: 'image',
    label: 'Image',
    icon: <Image size={16} />,
    content: '<div style="text-align: center; padding: 10px;"><img src="https://via.placeholder.com/600x200" alt="Image" style="max-width: 100%; height: auto;" /></div>'
  },
  {
    id: 'button-template',
    type: 'button',
    label: 'Button',
    icon: <ButtonIcon size={16} />,
    content: '<div style="text-align: center; padding: 15px;"><a href="#" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Click Here</a></div>'
  },
  {
    id: 'divider-template',
    type: 'divider',
    label: 'Divider',
    icon: <Separator className="w-4 h-4" />,
    content: '<hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;" />'
  },
  {
    id: 'spacer-template',
    type: 'spacer',
    label: 'Spacer',
    icon: <Layout size={16} />,
    content: '<div style="height: 30px;"></div>'
  }
];

// Type for template elements
type TemplateElement = {
  id: string;
  type: string;
  content: string;
};

export default function TemplateEditorPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  const [template, setTemplate] = useState<any>(null);
  const [activeElementId, setActiveElementId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState("edit");
  const [editingHtml, setEditingHtml] = useState<string | null>(null);

  // Data initialization and loading from localStorage
  useEffect(() => {
    let templatesList = mockTemplates;
    if (typeof window !== "undefined" && localStorage.getItem("templates")) {
      templatesList = JSON.parse(localStorage.getItem("templates") || "[]");
    }
    const found = templatesList.find((t: any) => t.id === id);
    if (found && !('elements' in found)) found.elements = [];
    setTemplate(found ?? null);
  }, [id]);

  // Persist to localStorage utility
  const saveToLocal = (updatedTemplate: any) => {
    if (typeof window !== "undefined") {
      const templates = JSON.parse(localStorage.getItem("templates") || "[]");
      const idx = templates.findIndex((t: any) => t.id === updatedTemplate.id);
      if (idx !== -1) {
        templates[idx] = updatedTemplate;
      } else {
        templates.push(updatedTemplate);
      }
      localStorage.setItem("templates", JSON.stringify(templates));
    }
  };

  // Drag-and-drop handlers
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination || !template) return;

    // Insert from componentTemplates
    if (source.droppableId === "component-templates") {
      const componentTemplate = componentTemplates.find((c) => c.id === draggableId);
      if (!componentTemplate) return;
      const newElement: TemplateElement = {
        id: `${componentTemplate.type}-${Date.now()}`,
        type: componentTemplate.type,
        content: componentTemplate.content,
      };
      const newElements = Array.from(template.elements);
      newElements.splice(destination.index, 0, newElement);
      setTemplate({ ...template, elements: newElements });
      return;
    }

    // Reorder within template elements
    if (
      source.droppableId === "template-elements" &&
      destination.droppableId === "template-elements"
    ) {
      const newElements = Array.from(template.elements);
      const [moved] = newElements.splice(source.index, 1);
      newElements.splice(destination.index, 0, moved);
      setTemplate({ ...template, elements: newElements });
      return;
    }
  };

  // Update element content
  const updateElementContent = (elementId: string, newContent: string) => {
    if (!template) return;
    const updatedElements = template.elements.map((element: TemplateElement) =>
      element.id === elementId ? { ...element, content: newContent } : element
    );
    setTemplate({ ...template, elements: updatedElements });
    setEditingHtml(null);
  };

  // Delete an element
  const deleteElement = (elementId: string) => {
    if (!template) return;
    const updatedElements = template.elements.filter((element: TemplateElement) => element.id !== elementId);
    setTemplate({ ...template, elements: updatedElements });
    setActiveElementId(null);
  };

  // Duplicate element
  const duplicateElement = (elementId: string) => {
    if (!template) return;
    const elementToDuplicate = template.elements.find((element: TemplateElement) => element.id === elementId);
    if (!elementToDuplicate) return;
    const duplicated = {
      ...elementToDuplicate,
      id: `${elementToDuplicate.type}-${Date.now()}`,
    };
    const idx = template.elements.findIndex((element: TemplateElement) => element.id === elementId);
    const updatedElements = Array.from(template.elements);
    updatedElements.splice(idx + 1, 0, duplicated);
    setTemplate({ ...template, elements: updatedElements });
  };

  // Save template (persist to localStorage for now)
  const handleSave = () => {
    if (!template) return;
    const updated = { ...template, lastUpdated: new Date().toISOString() };
    setTemplate(updated);
    saveToLocal(updated);
  };

  // Render HTML
  const renderTemplateHtml = () => {
    const baseStyles = `
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
      </style>
    `;
    const elementsHtml = template.elements.map((element: TemplateElement) => element.content).join('');
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${template.name}</title>
        ${baseStyles}
      </head>
      <body>
        <div class="email-container">
          ${elementsHtml}
        </div>
      </body>
      </html>
    `;
  };

  // Element editing
  const ElementEditor = ({ element }: { element: TemplateElement }) => {
    const [localContent, setLocalContent] = useState(element.content);

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Edit {element.type.charAt(0).toUpperCase() + element.type.slice(1)}</h3>
          <Button size="sm" variant="ghost" onClick={() => setActiveElementId(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>
        <div className="space-y-2">
          <Label htmlFor="html-content">HTML Content</Label>
          <Textarea
            id="html-content"
            value={localContent}
            onChange={(e) => setLocalContent(e.target.value)}
            className="font-mono text-sm h-60"
          />
        </div>
        <Button onClick={() => updateElementContent(element.id, localContent)}>
          Save Changes
        </Button>
      </div>
    );
  };

  if (template === null) {
    return (
      <div className="flex flex-col items-center gap-8 p-10">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold mb-4">Template Not Found</h2>
            <p>The template you're looking for doesn't exist.</p>
            <Button className="mt-6" asChild>
              <Link href="/templates">
                Back to Templates
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // UI
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/templates">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <Input
              className="text-2xl font-bold tracking-tight px-0 py-1 border-0 focus:ring-0 focus:outline-none bg-transparent"
              style={{ maxWidth: 350, fontSize: 24 }}
              value={template.name}
              onChange={(e) => setTemplate((t: any) => ({ ...t, name: e.target.value }))}
              placeholder="Template name"
            />
            <Textarea
              className="text-sm text-muted-foreground px-0 py-0 border-0 focus:ring-0 focus:outline-none bg-transparent mt-1"
              style={{ maxWidth: 350, resize: "none" }}
              value={template.description}
              onChange={(e) => setTemplate((t: any) => ({ ...t, description: e.target.value }))}
              placeholder="Description"
              rows={2}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentTab("preview")}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Template
          </Button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Editor Sidebar */}
        <div className="md:col-span-4 space-y-4">
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="html">HTML</TabsTrigger>
            </TabsList>
            {/* Edit Tab */}
            <TabsContent value="edit" className="space-y-4 mt-4">
              {activeElementId ? (
                <ElementEditor
                  element={template.elements.find((el: TemplateElement) => el.id === activeElementId)!}
                />
              ) : (
                <>
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="text-sm font-medium mb-2">Components</h3>
                      <p className="text-xs text-muted-foreground mb-4">
                        Drag components to add them to your template.
                      </p>
                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="component-templates" isDropDisabled={true}>
                          {(provided) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className="grid grid-cols-2 gap-2"
                            >
                              {componentTemplates.map((component, index) => (
                                <Draggable key={component.id} draggableId={component.id} index={index}>
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className="border rounded-md p-2 flex flex-col items-center justify-center gap-1 bg-white cursor-grab hover:border-primary"
                                    >
                                      {component.icon}
                                      <span className="text-xs">{component.label}</span>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="text-sm font-medium mb-2">Template Settings</h3>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label htmlFor="template-name">Template Name</Label>
                          <Input
                            id="template-name"
                            value={template.name}
                            onChange={(e) =>
                              setTemplate((t: any) => ({ ...t, name: e.target.value }))
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="template-description">Description</Label>
                          <Textarea
                            id="template-description"
                            value={template.description}
                            onChange={(e) =>
                              setTemplate((t: any) => ({ ...t, description: e.target.value }))
                            }
                            className="resize-none h-20"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
            {/* HTML Tab */}
            <TabsContent value="html" className="space-y-4 mt-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium mb-2">HTML Source</h3>
                  <p className="text-xs text-muted-foreground mb-4">View or edit the complete HTML of your template.</p>
                  <Textarea
                    value={renderTemplateHtml()}
                    className="font-mono text-xs h-[400px]"
                    readOnly
                  />
                  <div className="mt-4">
                    <Button size="sm" variant="outline" onClick={() => {
                      navigator.clipboard.writeText(renderTemplateHtml());
                    }}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy HTML
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        {/* Preview Area */}
        <div className="md:col-span-8">
          <Card className="border-2">
            <CardContent className="p-0">
              <div className="bg-gray-100 flex justify-center p-4">
                <div
                  className="bg-white w-full max-w-[600px] min-h-[600px] shadow-md"
                  style={{ outline: currentTab === "edit" ? "2px solid #f3f4f6" : "none" }}
                >
                  {currentTab === "edit" ? (
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="template-elements">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="min-h-[600px]"
                          >
                            {template.elements.length === 0 ? (
                              <div className="h-[600px] flex flex-col items-center justify-center text-center p-4">
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                  <Plus className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="font-medium mb-1">Add Components</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                  Drag and drop components from the sidebar to build your template
                                </p>
                              </div>
                            ) : (
                              template.elements.map((element: TemplateElement, index: number) => (
                                <Draggable key={element.id} draggableId={element.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={`relative group ${snapshot.isDragging ? 'opacity-50' : ''}`}
                                      tabIndex={0}
                                    >
                                      {/* Element toolbar: open editor, duplicate, delete, drag handle */}
                                      <div className="absolute top-0 right-0 flex space-x-1 p-1 opacity-0 group-hover:opacity-100 z-10 bg-white border rounded-md shadow-sm">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => setActiveElementId(element.id)}
                                          title="Edit"
                                        >
                                          <Type className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => duplicateElement(element.id)}
                                          title="Duplicate"
                                        >
                                          <Copy className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => deleteElement(element.id)}
                                          title="Delete"
                                        >
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                        <span
                                          {...provided.dragHandleProps}
                                          className="h-8 w-8 flex items-center justify-center cursor-grab"
                                          title="Drag"
                                        >
                                          <Layout className="h-4 w-4 text-muted-foreground" />
                                        </span>
                                      </div>
                                      <div
                                        dangerouslySetInnerHTML={{ __html: element.content }}
                                        className="py-2"
                                      />
                                    </div>
                                  )}
                                </Draggable>
                              ))
                            )}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  ) : (
                    // Render full preview
                    <iframe
                      title="Template Preview"
                      srcDoc={renderTemplateHtml()}
                      style={{
                        width: '100%',
                        height: '600px',
                        border: 'none',
                        background: 'white'
                      }}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}