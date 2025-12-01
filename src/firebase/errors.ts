// @/lib/firebase/errors.ts

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  public context: SecurityRuleContext;
  public originalError?: Error;

  constructor(context: SecurityRuleContext, originalError?: Error) {
    const formattedContext = JSON.stringify(
      {
        request: {
          path: context.path,
          method: context.operation,
          resource: {
            data: context.requestResourceData,
          },
        },
      },
      null,
      2
    );

    const message = `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:\n${formattedContext}`;
    
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;
    this.originalError = originalError;

    // This is for correctly setting the prototype in environments where it might not be set automatically.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
