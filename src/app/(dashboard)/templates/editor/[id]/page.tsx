"use client";

import React, { useState } from 'react';
import { ArrowLeft, Save, Eye, Copy, Trash, Layout, Image, Type, Button as ButtonIcon, List, Link as LinkIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Mock template data
const initialTemplate = {
  id: '1',
  name: 'Monthly Newsletter',
  description: 'A template for monthly updates and announcements',
  elements: [
    {
      id: 'header-1',
      type: 'header',
      content: '<h1 style="color: #4f46e5; text-align: center; padding: 20px;">Monthly Newsletter</h1>'
    },
    {
      id: 'text-1',
      type: 'text',
      content: '<p style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">Welcome to our monthly newsletter! In this edition, we\'ll cover the latest updates, features, and tips to help you get the most out of our platform.</p>'
    },
    {
      id: 'image-1',
      type: 'image',
      content: '<div style="text-align: center; padding: 20px;"><img src="https://via.placeholder.com/600x300" alt="Featured Image" style="max-width: 100%; height: auto;" /></div>'
    },
    {
      id: 'button-1',
      type: 'button',
      content: '<div style="text-align: center; padding: 20px;"><a href="#" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Read More</a></div>'
    }
  ]
};

// Component templates that can be added to the email
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

export default function TemplateEditorPage({ params }: { params: { id: string } }) {
  const [template, setTemplate] = useState(initialTemplate);
  const [activeElementId, setActiveElementId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState("edit");
  const [editingHtml, setEditingHtml] = useState<string | null>(null);

  // Handle dropping of elements (reordering or adding new elements)
  const handleDragEnd = (result: any) => {
    const { source, destination, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // If source is from component templates
    if (source.droppableId === 'component-templates') {
      const componentTemplate = componentTemplates.find(c => c.id === draggableId);
      if (!componentTemplate) return;

      // Create a new element with unique ID
      const newElement = {
        id: `${componentTemplate.type}-${Date.now()}`,
        type: componentTemplate.type,
        content: componentTemplate.content
      };

      // Add the new element to the template
      const newElements = [...template.elements];
      newElements.splice(destination.index, 0, newElement);

      setTemplate({
        ...template,
        elements: newElements
      });
      return;
    }

    // If reordering within template elements
    if (source.droppableId === 'template-elements' && destination.droppableId === 'template-elements') {
      const newElements = [...template.elements];
      const [movedElement] = newElements.splice(source.index, 1);
      newElements.splice(destination.index, 0, movedElement);

      setTemplate({
        ...template,
        elements: newElements
      });
    }
  };

  // Function to update element content
  const updateElementContent = (elementId: string, newContent: string) => {
    const updatedElements = template.elements.map(element => 
      element.id === elementId ? { ...element, content: newContent } : element
    );

    setTemplate({
      ...template,
      elements: updatedElements
    });
  };

  // Function to delete an element
  const deleteElement = (elementId: string) => {
    const updatedElements = template.elements.filter(element => element.id !== elementId);
    setTemplate({
      ...template,
      elements: updatedElements
    });
    setActiveElementId(null);
  };

  // Function to duplicate an element
  const duplicateElement = (elementId: string) => {
    const elementToDuplicate = template.elements.find(element => element.id === elementId);
    if (!elementToDuplicate) return;

    const duplicatedElement = {
      ...elementToDuplicate,
      id: `${elementToDuplicate.type}-${Date.now()}`
    };

    const elementIndex = template.elements.findIndex(element => element.id === elementId);
    const updatedElements = [...template.elements];
    updatedElements.splice(elementIndex + 1, 0, duplicatedElement);

    setTemplate({
      ...template,
      elements: updatedElements
    });
  };

  // Render full template HTML
  const renderTemplateHtml = () => {
    const baseStyles = `
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
      </style>
    `;
    
    const elementsHtml = template.elements.map(element => element.content).join('');
    
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

  // Editor component for element content
  const ElementEditor = ({ element }: { element: typeof template.elements[0] }) => {
    const [localContent, setLocalContent] = useState(element.content);

    const handleSaveChanges = () => {
      updateElementContent(element.id, localContent);
      setEditingHtml(null);
    };

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
        
        <Button onClick={handleSaveChanges}>
          Save Changes
        </Button>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/templates">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{template.name}</h1>
            <p className="text-sm text-muted-foreground">{template.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save Template
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Editor Sidebar */}
        <div className="md:col-span-4 space-y-4">
          <Tabs defaultValue="edit" onValueChange={setCurrentTab}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="html">HTML</TabsTrigger>
            </TabsList>
            
            <TabsContent value="edit" className="space-y-4 mt-4">
              {activeElementId ? (
                <ElementEditor 
                  element={template.elements.find(el => el.id === activeElementId)!} 
                />
              ) : (
                <>
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="text-sm font-medium mb-2">Components</h3>
                      <p className="text-xs text-muted-foreground mb-4">Drag components to add them to your template.</p>
                      
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
                            onChange={(e) => setTemplate({...template, name: e.target.value})}
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label htmlFor="template-description">Description</Label>
                          <Textarea 
                            id="template-description" 
                            value={template.description}
                            onChange={(e) => setTemplate({...template, description: e.target.value})}
                            className="resize-none h-20"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
            
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
                    <Button size="sm" variant="outline">
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
                  style={{ outline: currentTab === 'edit' ? '2px solid #f3f4f6' : 'none' }}
                >
                  {currentTab === 'edit' ? (
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
                              template.elements.map((element, index) => (
                                <Draggable key={element.id} draggableId={element.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={`relative group ${snapshot.isDragging ? 'opacity-50' : ''}`}
                                    >
                                      {/* Element toolbar */}
                                      <div className="absolute top-0 right-0 hidden group-hover:flex bg-background border rounded-md shadow-sm z-10">
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-8 w-8"
                                          onClick={() => setActiveElementId(element.id)}
                                        >
                                          <Type className="h-4 w-4" />
                                        </Button>
                                        <Separator orientation="vertical" className="h-8" />
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-8 w-8"
                                          onClick={() => duplicateElement(element.id)}
                                        >
                                          <Copy className="h-4 w-4" />
                                        </Button>
                                        <Separator orientation="vertical" className="h-8" />
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-8 w-8 text-destructive hover:text-destructive"
                                          onClick={() => deleteElement(element.id)}
                                        >
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      
                                      {/* Drag handle */}
                                      <div 
                                        {...provided.dragHandleProps}
                                        className="absolute top-0 left-0 h-full w-6 hidden group-hover:flex flex-col items-center justify-center cursor-grab"
                                      >
                                        <div className="w-4 h-1 bg-muted-foreground rounded mb-1"></div>
                                        <div className="w-4 h-1 bg-muted-foreground rounded"></div>
                                      </div>
                                      
                                      {/* Element content */}
                                      <div 
                                        className={`p-1 ${snapshot.isDragging ? 'bg-muted' : ''} ${activeElementId === element.id ? 'outline outline-2 outline-primary' : ''}`}
                                        onClick={() => setActiveElementId(element.id)}
                                        dangerouslySetInnerHTML={{ __html: element.content }}
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
                    <div 
                      className="min-h-[600px]"
                      dangerouslySetInnerHTML={{ __html: template.elements.map(el => el.content).join('') }}
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