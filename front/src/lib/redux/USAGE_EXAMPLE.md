# Redux with tRPC Usage Example

## How to dispatch the async thunk in a component

```tsx
"use client";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { getFilledTemplateByIdAsyncThunk } from "@/lib/redux/formSlice/formSlice";

export default function FormPage({ params }: { params: { formId: string } }) {
  const dispatch = useAppDispatch();
  const { form, isLoading, error } = useAppSelector((state) => state.form);

  useEffect(() => {
    // Dispatch the async thunk to fetch the filled template
    dispatch(getFilledTemplateByIdAsyncThunk(params.formId));
  }, [params.formId, dispatch]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!form) {
    return <div>No form data</div>;
  }

  return (
    <div>
      <h1>{form.name}</h1>
      {/* Render your form here */}
      {/* Each question will have an 'answer' field populated if the user has submitted it */}
    </div>
  );
}
```

## Key Points

1. **The tRPC client is imported from `@/lib/trpc-client`** - This is a singleton that works outside React components
2. **Use `useAppDispatch` and `useAppSelector`** - These are typed versions of Redux hooks
3. **The async thunk calls `trpcClient.getFilledTemplateById.query()`** - No React hooks needed!
4. **Questions will have an `answer` property** - Will be `null` if user hasn't answered yet

## Direct tRPC Client Usage (without Redux)

If you want to use tRPC directly without Redux:

```tsx
import { trpcClient } from "@/lib/trpc-client";

// In any function, async thunk, or server action
const template = await trpcClient.getFilledTemplateById.query({ id: "template-id" });
const userMedia = await trpcClient.getUserMedia.query();
```
