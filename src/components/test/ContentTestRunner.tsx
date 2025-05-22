"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { runContentTests } from '@/lib/test/content-test';
import { Copy, Check } from 'lucide-react';

export function ContentTestRunner() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleRunTests = async () => {
    setIsRunning(true);
    setResults([]);
    setCopied(false);

    // Capture console output
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    
    const logs: string[] = [];
    
    console.log = (...args) => {
      logs.push(args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
      originalConsoleLog.apply(console, args);
    };
    
    console.error = (...args) => {
      logs.push('❌ ' + args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
      originalConsoleError.apply(console, args);
    };

    try {
      await runContentTests();
    } finally {
      // Restore console
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      setResults(logs);
      setIsRunning(false);
    }
  };

  const handleCopyResults = async () => {
    const formattedResults = formatResultsForSharing(results);
    await navigator.clipboard.writeText(formattedResults);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatResultsForSharing = (logs: string[]): string => {
    const header = "=== Content System Test Results ===\n";
    const timestamp = `Test run at: ${new Date().toLocaleString()}\n\n`;
    const content = logs.join('\n');
    return header + timestamp + content;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Content Validation Tests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={handleRunTests} 
              disabled={isRunning}
            >
              {isRunning ? 'Running Tests...' : 'Run Tests'}
            </Button>

            {results.length > 0 && (
              <Button
                variant="outline"
                onClick={handleCopyResults}
                className="flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Results
                  </>
                )}
              </Button>
            )}
          </div>

          {results.length > 0 && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">
                {results.join('\n')}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 