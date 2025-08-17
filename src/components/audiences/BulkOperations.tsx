'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { 
  CheckCircle2,
  Download,
  Trash2,
  Edit,
  Copy,
  Tag,
  Archive,
  Eye,
  FileText,
  AlertTriangle,
  X
} from 'lucide-react';
import type { Audience } from '@/hooks/use-audience-data';

interface BulkOperationsProps {
  audiences: Audience[];
  selectedIds: Set<string>;
  onSelectionChange: (audienceId: string, selected: boolean) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onBulkDelete?: (audienceIds: string[]) => Promise<void>;
  onBulkExport?: (audienceIds: string[], format: 'csv' | 'json') => Promise<void>;
  onBulkEdit?: (audienceIds: string[], updates: Partial<Audience>) => Promise<void>;
  onBulkArchive?: (audienceIds: string[]) => Promise<void>;
  onBulkDuplicate?: (audienceIds: string[]) => Promise<void>;
}

interface BulkEditFormData {
  status?: string;
  tags?: string[];
  addTags?: string;
  removeTags?: string;
}

export default function BulkOperations({
  audiences,
  selectedIds,
  onSelectionChange,
  onSelectAll,
  onSelectNone,
  onBulkDelete,
  onBulkExport,
  onBulkEdit,
  onBulkArchive,
  onBulkDuplicate
}: BulkOperationsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingOperation, setProcessingOperation] = useState<string>('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState<BulkEditFormData>({});

  const selectedAudiences = audiences.filter(audience => selectedIds.has(audience.id));
  const allSelected = audiences.length > 0 && selectedIds.size === audiences.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < audiences.length;

  const handleSelectAllChange = useCallback((checked: boolean) => {
    if (checked) {
      onSelectAll();
    } else {
      onSelectNone();
    }
  }, [onSelectAll, onSelectNone]);

  const executeWithProgress = useCallback(async (
    operation: () => Promise<void>,
    operationName: string
  ) => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingOperation(operationName);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      await operation();

      clearInterval(progressInterval);
      setProcessingProgress(100);

      // Small delay to show completion
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingProgress(0);
        setProcessingOperation('');
      }, 500);

    } catch (error) {
      setIsProcessing(false);
      setProcessingProgress(0);
      setProcessingOperation('');
      throw error;
    }
  }, []);

  const handleBulkDelete = useCallback(async () => {
    if (!onBulkDelete) return;

    try {
      await executeWithProgress(
        () => onBulkDelete(Array.from(selectedIds)),
        'Deleting audiences'
      );
      
      toast({
        title: "Success",
        description: `Deleted ${selectedIds.size} audience(s) successfully`,
      });
      
      onSelectNone();
      setShowDeleteDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete audiences. Please try again.",
        variant: "destructive",
      });
    }
  }, [selectedIds, onBulkDelete, executeWithProgress, onSelectNone]);

  const handleBulkExport = useCallback(async (format: 'csv' | 'json') => {
    if (!onBulkExport) return;

    try {
      await executeWithProgress(
        () => onBulkExport(Array.from(selectedIds), format),
        `Exporting to ${format.toUpperCase()}`
      );
      
      toast({
        title: "Success",
        description: `Exported ${selectedIds.size} audience(s) to ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export audiences. Please try again.",
        variant: "destructive",
      });
    }
  }, [selectedIds, onBulkExport, executeWithProgress]);

  const handleBulkEdit = useCallback(async () => {
    if (!onBulkEdit) return;

    const updates: Partial<Audience> = {};
    
    if (editFormData.status) {
      updates.status = editFormData.status as any;
    }

    // Handle tag operations
    if (editFormData.addTags || editFormData.removeTags) {
      // This would need to be handled specially in the API
      // For now, we'll just update with the form data
    }

    try {
      await executeWithProgress(
        () => onBulkEdit(Array.from(selectedIds), updates),
        'Updating audiences'
      );
      
      toast({
        title: "Success",
        description: `Updated ${selectedIds.size} audience(s) successfully`,
      });
      
      setShowEditDialog(false);
      setEditFormData({});
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to update audiences. Please try again.",
        variant: "destructive",
      });
    }
  }, [selectedIds, editFormData, onBulkEdit, executeWithProgress]);

  const handleBulkArchive = useCallback(async () => {
    if (!onBulkArchive) return;

    try {
      await executeWithProgress(
        () => onBulkArchive(Array.from(selectedIds)),
        'Archiving audiences'
      );
      
      toast({
        title: "Success",
        description: `Archived ${selectedIds.size} audience(s) successfully`,
      });
      
      onSelectNone();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive audiences. Please try again.",
        variant: "destructive",
      });
    }
  }, [selectedIds, onBulkArchive, executeWithProgress, onSelectNone]);

  const handleBulkDuplicate = useCallback(async () => {
    if (!onBulkDuplicate) return;

    try {
      await executeWithProgress(
        () => onBulkDuplicate(Array.from(selectedIds)),
        'Duplicating audiences'
      );
      
      toast({
        title: "Success",
        description: `Duplicated ${selectedIds.size} audience(s) successfully`,
      });
      
      onSelectNone();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate audiences. Please try again.",
        variant: "destructive",
      });
    }
  }, [selectedIds, onBulkDuplicate, executeWithProgress, onSelectNone]);

  if (isProcessing) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="font-medium">{processingOperation}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {Math.round(processingProgress)}%
              </span>
            </div>
            <Progress value={processingProgress} className="w-full" />
            <p className="text-sm text-muted-foreground">
              Processing {selectedIds.size} audience(s)...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (selectedIds.size === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Bulk Operations
            <Badge variant="secondary">
              {selectedIds.size} selected
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSelectNone}
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Selection Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected}
              onCheckedChange={handleSelectAllChange}
              id="select-all"
            />
            <label 
              htmlFor="select-all"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Select all {audiences.length} audiences
            </label>
          </div>
          {someSelected && (
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} of {audiences.length} selected
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Export Options */}
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkExport('csv')}
              disabled={selectedIds.size === 0}
            >
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkExport('json')}
              disabled={selectedIds.size === 0}
            >
              <FileText className="h-4 w-4 mr-1" />
              Export JSON
            </Button>
          </div>

          {/* Edit */}
          {onBulkEdit && (
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selectedIds.size === 0}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Edit Audiences</DialogTitle>
                  <DialogDescription>
                    Edit properties for {selectedIds.size} selected audience(s)
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select 
                      value={editFormData.status || ''} 
                      onValueChange={(value) => setEditFormData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="PROCESSING">Processing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Add Tags</label>
                    <input
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Enter tags separated by commas"
                      value={editFormData.addTags || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, addTags: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Remove Tags</label>
                    <input
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Enter tags to remove, separated by commas"
                      value={editFormData.removeTags || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, removeTags: e.target.value }))}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleBulkEdit}>
                    Update {selectedIds.size} Audience(s)
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Duplicate */}
          {onBulkDuplicate && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDuplicate}
              disabled={selectedIds.size === 0}
            >
              <Copy className="h-4 w-4 mr-1" />
              Duplicate
            </Button>
          )}

          {/* Archive */}
          {onBulkArchive && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkArchive}
              disabled={selectedIds.size === 0}
            >
              <Archive className="h-4 w-4 mr-1" />
              Archive
            </Button>
          )}

          {/* Delete */}
          {onBulkDelete && (
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selectedIds.size === 0}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Delete Audiences
                  </DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete {selectedIds.size} audience(s)? 
                    This action cannot be undone and will permanently remove:
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {selectedAudiences.slice(0, 5).map(audience => (
                      <li key={audience.id}>{audience.name}</li>
                    ))}
                    {selectedAudiences.length > 5 && (
                      <li className="text-muted-foreground">
                        ...and {selectedAudiences.length - 5} more
                      </li>
                    )}
                  </ul>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleBulkDelete}>
                    Delete {selectedIds.size} Audience(s)
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Selected Audiences Preview */}
        {selectedIds.size > 0 && selectedIds.size <= 10 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Selected Audiences:</label>
            <div className="flex flex-wrap gap-1">
              {selectedAudiences.map(audience => (
                <Badge 
                  key={audience.id} 
                  variant="secondary" 
                  className="text-xs cursor-pointer"
                  onClick={() => onSelectionChange(audience.id, false)}
                >
                  {audience.name}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}