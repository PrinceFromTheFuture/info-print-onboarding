# Testing the Redux Form Integration

## How to Test

### 1. Start the Backend

```bash
cd back
bun run dev
```

The backend should start on the configured port (check `BACKEND_URL` in your environment).

### 2. Start the Frontend

```bash
cd front
npm run dev
```

### 3. Navigate to a Form

Visit: `http://localhost:3000/form/[TEMPLATE_ID]`

Replace `[TEMPLATE_ID]` with an actual template ID from your database.

## What to Check

### ✅ Sidebar Navigation (FREE - No restrictions)

- [ ] Sidebar is visible on desktop
- [ ] All sections are listed in the sidebar
- [ ] Clicking ANY section button changes the main content
- [ ] Clicking works EVEN IF current section is incomplete
- [ ] Current section is highlighted in the sidebar
- [ ] Completed sections show a checkmark icon

### ✅ Form Loading

- [ ] Loading spinner appears while fetching
- [ ] Form data loads from backend
- [ ] Previous answers are populated in fields
- [ ] Empty fields show as empty (no placeholder pollution)

### ✅ Field Editing

- [ ] Can type in text fields
- [ ] Changes update Redux state (check Redux DevTools)
- [ ] Values persist when switching sections and coming back
- [ ] All field types work (text, number, select, date, checkbox, image)

### ✅ Next/Previous Buttons

- [ ] "Next" button is DISABLED if current section incomplete
- [ ] "Next" button shows validation error toast if incomplete
- [ ] "Previous" button always works (no validation)
- [ ] Last section shows "Submit" instead of "Next"

### ✅ Validation Warnings

- [ ] Yellow warning card appears when section incomplete
- [ ] Warning lists which fields are required
- [ ] Warning doesn't prevent sidebar navigation
- [ ] Warning only blocks "Next" button

## Debug Console Logs

When testing, open the browser console. You should see:

### On Load:

```
📊 Redux State: { templateLoaded: true, sectionsCount: 5, currentSectionIndex: 0, ... }
```

### When Clicking Sidebar:

```
🖱️ Sidebar: Clicked section 2 - Personal Information
🔄 Changing section to index: 2
📊 Redux State: { ..., currentSectionIndex: 2, ... }
```

### When Typing in Fields:

Redux DevTools should show `form/setFieldValue` actions being dispatched.

## Common Issues & Solutions

### Issue: Sidebar sections not visible

**Cause:** Template not loading from backend  
**Solution:**

- Check backend is running
- Check console for API errors
- Verify template ID is correct
- Check network tab for failed requests

### Issue: Can't click sidebar sections

**Cause:** Very unlikely with current implementation, but could be:

1. Overlay blocking clicks (fixed in latest code)
2. CSS z-index issue
3. JavaScript error preventing handlers

**Solution:**

- Check console for JavaScript errors
- Verify console shows "🖱️ Sidebar: Clicked section..." when clicking
- Check if sidebar is actually visible (might be hidden off-screen on mobile)

### Issue: Fields not editable

**Cause:** onChange not wired up, or fields are disabled  
**Solution:**

- Check QuestionRenderer is passing onChange correctly
- Check Redux DevTools for `form/setFieldValue` actions
- Verify no JavaScript errors in console

### Issue: "Next" button won't work even when complete

**Cause:** Validation logic bug  
**Solution:**

- Check console logs
- Verify all required fields have values in Redux state
- Check validation.ts logic

## Expected Behavior Summary

| Action                        | Restriction                         | Result                                      |
| ----------------------------- | ----------------------------------- | ------------------------------------------- |
| Click sidebar section         | ❌ None                             | Always works, jumps to that section         |
| Click "Previous"              | ❌ None                             | Always works, goes to previous section      |
| Click "Next"                  | ✅ Current section must be complete | Works if complete, shows error toast if not |
| Edit any field                | ❌ None                             | Always works, updates Redux                 |
| Click "Submit" (last section) | ✅ All sections must be complete    | Works if all complete, shows error if not   |

## Redux State Structure

Check Redux DevTools to see:

```javascript
{
  form: {
    form: { /* Template object with sections, groups, questions */ },
    isLoading: false,
    error: null,
    currentSectionIndex: 0,
    formData: {
      "question-id-1": "User's answer",
      "question-id-2": "Another answer",
      // ...
    },
    completedSections: ["section-id-1", "section-id-2"],
    sidebarOpen: false
  }
}
```

## Success Criteria

The integration is working correctly if:

1. ✅ You can see all sections in the sidebar
2. ✅ Clicking any section immediately switches the view (no restrictions)
3. ✅ Fields are editable and changes persist
4. ✅ Redux state updates with each field change
5. ✅ "Next" button validates before allowing progression
6. ✅ Sidebar navigation has NO validation (always works)
7. ✅ Form loads with previous answers populated
