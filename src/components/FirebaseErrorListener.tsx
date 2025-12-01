// @/components/FirebaseErrorListener.tsx
'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

// This is a client-side only component that will be used to display
// the permission error overlay. It's rendered in the root layout.
function PermissionErrorDisplay({ error }: { error: Error }) {
  // In a Next.js dev environment, this will be caught by the dev overlay
  // which is exactly what we want. We throw it here so it's caught
  // by the boundary and displayed nicely.
  throw error;
}

export function FirebaseErrorListener() {
  const [permissionError, setPermissionError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (error: Error) => {
      console.log("Error caught by listener:", error.message);
      setPermissionError(error);
    };

    errorEmitter.on('permission-error', handleError);

    // No cleanup function is needed here as the emitter is a singleton
    // and we want it to persist throughout the app's lifecycle.
  }, []);

  if (permissionError) {
    // Render the component that will throw and trigger the dev overlay.
    return <PermissionErrorDisplay error={permissionError} />;
  }

  return null;
}
