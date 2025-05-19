import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useNavigationWarning(isDirty: boolean) {
  const router = useRouter();

  useEffect(() => {
    const handleWindowClose = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      return (e.returnValue = 'You have unsaved changes. Are you sure you want to leave?');
    };

    const handleBrowseAway = () => {
      if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        router.back();
        throw 'routeChange aborted.';
      }
    };

    window.addEventListener('beforeunload', handleWindowClose);
    window.addEventListener('popstate', handleBrowseAway);

    return () => {
      window.removeEventListener('beforeunload', handleWindowClose);
      window.removeEventListener('popstate', handleBrowseAway);
    };
  }, [isDirty, router]);
} 