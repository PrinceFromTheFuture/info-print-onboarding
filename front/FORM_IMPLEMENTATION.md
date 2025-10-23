# Form Implementation with Optimistic Updates

## Overview

This document describes the implementation of the form system with optimistic updates, debounced API calls, and image uploads.

## Architecture

### Redux State Management (`formSlice.ts`)

The form state is managed in Redux with the following key features:

1. **Optimistic Updates**: Field values are updated immediately in the UI before the API call completes
2. **Debounced Text Inputs**: Text and number inputs wait 2 seconds after the user stops typing before saving
3. **Immediate Saves**: Select, date, checkbox, and image inputs save immediately
4. **Loading States**: Each question has its own loading state to show feedback to the user
5. **Error Handling**: Errors are tracked per question and displayed to the user

### State Structure

```typescript
interface FormState {
  form: null | FilledForm;
  isLoading: boolean;
  error: string | null;
  currentSectionIndex: number;
  formData: Record<string, any>; // Optimistic data
  completedSections: string[];
  sidebarOpen: boolean;
  questionLoadingStates: Record<string, boolean>; // Per-question loading
  questionErrors: Record<string, string | null>; // Per-question errors
}
```

### Async Thunks

#### 1. `updateOrCreateSubmissionAsyncThunk`

- Saves a submission to the database
- Called after debounce timeout for text inputs
- Called immediately for select/date/checkbox inputs

#### 2. `uploadImageAsyncThunk`

- Uploads an image file to the server
- Receives the file URL back
- Stores the URL in Redux state
- Automatically creates a submission with the image URL

#### 3. `debouncedFieldUpdate`

- Helper function for debounced updates
- Optimistically updates the field immediately
- Sets a timeout to save after 2 seconds
- Cancels previous timeouts for the same field

## Input Components

### Text Input & Number Input

- Use `debouncedFieldUpdate` action
- Show loading spinner on the right side while saving
- Display error messages below the input
- Debounce timeout: 2000ms (2 seconds)

### Select Input, Date Input, Checkbox Input

- Use `updateOrCreateSubmissionAsyncThunk` directly
- Save immediately on change
- Show loading spinner next to the label
- Display error messages below the input

### Image Input

- Upload flow:
  1. User selects a file
  2. Show local preview immediately
  3. Upload to server via `/api/media/upload` endpoint
  4. Receive file URL from server
  5. Store URL in Redux state
  6. Create submission with the URL
  7. Display the uploaded image from server URL
- Show loading overlay during upload
- Display error messages below the input

## API Endpoints

### Backend Routes

#### `/api/media/upload` (POST)

- Accepts: `{ fileData: string, fileName: string, alt?: string }`
- Returns: `{ success: true, fileUrl: string, mediaId: string, filename: string }`
- Stores file in `media/` directory
- Creates a record in the `media` collection

#### `/api/media/file/:filename` (GET)

- Static file serving
- Serves images from `media/` directory

### tRPC Mutations

#### `submittionsRouter.updateOrCreateSubmission`

- Input: `{ questionId: string, value: string }`
- Checks if submission exists for the question and user
- Updates existing submission or creates new one
- Returns: `{ submission, action: 'created' | 'updated' }`

## User Experience

### Optimistic Updates

- All inputs update immediately in the UI
- Users don't wait for the server to see their changes
- Loading indicators show when data is being saved

### Debouncing

- Text inputs don't spam the server on every keystroke
- Saves occur 2 seconds after the user stops typing
- Each field has independent debounce timers

### Loading States

- Text/Number inputs: Spinner on the right side
- Other inputs: Spinner next to the label
- Image uploads: Overlay on the preview

### Error Handling

- Errors are displayed below each input
- Toast notifications for image uploads
- Errors don't block user interaction

## Usage Example

```tsx
// The QuestionRenderer component automatically handles all input types
<QuestionRenderer question={question} value={formData[question.id]} onChange={(value) => onFieldChange(question.id, value)} />

// Each input type dispatches Redux actions internally:
// - TextInput uses debouncedFieldUpdate
// - SelectInput uses updateOrCreateSubmissionAsyncThunk immediately
// - ImageInput uses uploadImageAsyncThunk then updateOrCreateSubmissionAsyncThunk
```

## File Structure

```
front/src/
├── lib/redux/formSlice/
│   └── formSlice.ts              # Redux state and async thunks
├── app/(private)/form/[formId]/
│   ├── page.tsx                  # Main form page
│   └── _components/
│       ├── QuestionRenderer.tsx  # Routes to correct input component
│       ├── TextInput.tsx         # Debounced text input
│       ├── NumberInput.tsx       # Debounced number input
│       ├── SelectInput.tsx       # Immediate save
│       ├── DateInput.tsx         # Immediate save
│       ├── CheckboxInput.tsx     # Immediate save
│       └── ImageInput.tsx        # Upload then save

back/src/
├── index.ts                      # Express server with media upload endpoint
└── trpc/submitions/
    └── updateOrCreateSubmittion.ts  # tRPC mutation for submissions
```

## Configuration

### Debounce Timeout

Change the debounce time in `debouncedFieldUpdate`:

```typescript
export const debouncedFieldUpdate = (questionId: string, value: string, debounceMs: number = 2000)
```

### Server URL

Update the server URL in `uploadImageAsyncThunk` if not using localhost:

```typescript
const response = await fetch("http://localhost:3005/api/media/upload", {
```

### File Size Limits

Update in `back/src/index.ts`:

```typescript
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
```

## Testing

### Manual Testing Checklist

1. **Text Input**
   - [ ] Type text and verify it appears immediately
   - [ ] Stop typing and wait 2 seconds
   - [ ] Verify loading spinner appears
   - [ ] Verify data is saved (check network tab)

2. **Number Input**
   - [ ] Same as text input

3. **Select Input**
   - [ ] Select an option
   - [ ] Verify loading spinner appears immediately
   - [ ] Verify data is saved

4. **Date Input**
   - [ ] Pick a date
   - [ ] Verify loading spinner appears immediately
   - [ ] Verify data is saved

5. **Checkbox Input**
   - [ ] Toggle checkbox
   - [ ] Verify loading spinner appears immediately
   - [ ] Verify data is saved

6. **Image Input**
   - [ ] Select an image file
   - [ ] Verify local preview appears immediately
   - [ ] Verify loading overlay appears
   - [ ] Verify image is uploaded to server
   - [ ] Verify image URL is saved in submission
   - [ ] Verify image loads from server URL
   - [ ] Test remove button

## Known Limitations

1. **Image Storage**: Images are stored in the file system. For production, consider using a cloud storage service like S3.
2. **Debounce Persistence**: Debounce timers are in memory. If the page refreshes, pending saves may be lost.
3. **Network Errors**: Network failures during debounce may result in lost data. Consider implementing retry logic.
4. **Image Validation**: Basic validation only. Consider adding file size and dimension validation.

## Future Enhancements

1. Add retry logic for failed submissions
2. Implement offline support with service workers
3. Add image compression before upload
4. Add progress indicators for image uploads
5. Implement autosave notifications
6. Add conflict resolution for concurrent edits
