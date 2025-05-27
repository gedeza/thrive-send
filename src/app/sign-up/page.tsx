import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Join ThriveSend and start managing your social media presence
          </p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 
                'bg-primary hover:bg-primary/90 text-primary-foreground',
              footerActionLink: 
                'text-primary hover:text-primary/90',
            },
          }}
          signInUrl="/sign-in"
          redirectUrl="/create-organization"
        />
      </div>
    </div>
  );
} 