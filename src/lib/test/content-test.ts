import { ContentFormData, saveContent } from '@/lib/api/content-service';
import { contentFormSchema } from '@/lib/validations/content';

interface TestCase {
  name: string;
  data: Partial<ContentFormData>;
  shouldPass: boolean;
  expectedError?: string;
}

const testCases: TestCase[] = [
  {
    name: "Valid Blog Post",
    data: {
      title: "Test Blog Post",
      type: "blog",
      content: "This is a test blog post with more than 10 characters",
      tags: ["test"],
      status: "draft"
    },
    shouldPass: true
  },
  {
    name: "Valid Article",
    data: {
      title: "Test Article",
      type: "article",
      content: "This is a test article",
      tags: [],
      status: "draft"
    },
    shouldPass: true
  },
  {
    name: "Valid Social Post",
    data: {
      title: "Test Social Post",
      type: "social",
      content: "This is a test social post",
      tags: ["social"],
      status: "draft"
    },
    shouldPass: true
  },
  {
    name: "Valid Email",
    data: {
      title: "Test Email",
      type: "email",
      content: "This is a test email",
      tags: [],
      status: "draft"
    },
    shouldPass: true
  },
  {
    name: "Missing Content",
    data: {
      title: "Test Post",
      type: "blog",
      tags: [],
      status: "draft"
    },
    shouldPass: false,
    expectedError: "Content is required"
  },
  {
    name: "Invalid Type",
    data: {
      title: "Test Post",
      type: "invalid" as any,
      content: "Test content",
      tags: [],
      status: "draft"
    },
    shouldPass: false,
    expectedError: "Please select a valid content type"
  },
  {
    name: "Invalid Status",
    data: {
      title: "Test Post",
      type: "blog",
      content: "Test content",
      tags: [],
      status: "invalid" as any
    },
    shouldPass: false,
    expectedError: "Status must be either draft, scheduled, sent, or failed"
  }
];

export async function runContentTests() {
  console.log("Starting content validation tests...\n");
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    console.log(`\nTesting: ${testCase.name}`);
    console.log("Input data:", JSON.stringify(testCase.data, null, 2));
    
    try {
      // First validate against schema
      const validationResult = contentFormSchema.safeParse(testCase.data);
      
      if (validationResult.success !== testCase.shouldPass) {
        console.error("❌ Validation failed");
        console.error("Expected:", testCase.shouldPass ? "pass" : "fail");
        console.error("Actual:", validationResult.success ? "pass" : "fail");
        if (!validationResult.success) {
          console.error("Validation errors:", validationResult.error.format());
        }
        failed++;
        continue;
      }
      
      if (testCase.shouldPass) {
        // Try to save the content
        try {
          const result = await saveContent(testCase.data as ContentFormData);
          console.log("✅ Test passed");
          console.log("Saved content:", result);
          passed++;
        } catch (_error) {
          console.error("❌ Save operation failed");
          console.error("", _error);
          failed++;
        }
      } else {
        console.log("✅ Test passed (expected failure)");
        passed++;
      }
    } catch (_error) {
      console.error("❌ Test failed with unexpected error");
      console.error("", _error);
      failed++;
    }
  }
  
  console.log("\n=== Test Summary ===");
  console.log(`Total tests: ${testCases.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success rate: ${((passed / testCases.length) * 100).toFixed(2)}%`);
}

// Helper function to run tests from the browser console
if (typeof window !== 'undefined') {
  (window as any).runContentTests = runContentTests;
} 