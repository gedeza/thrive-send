import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to your ThriveSend account
          </p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 
                'bg-primary hover:bg-primary/90 text-primary-foreground',
              footerActionLink: 
                'text-primary hover:text-primary/90',
            },
          }}
          signUpUrl="/sign-up"
          redirectUrl="/content/calendar"
        />
      </div>
    </div>
  );
}
