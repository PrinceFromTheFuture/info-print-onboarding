# 🏗️ Seeding Architecture Documentation

## Critical Design Principle

### **1 Group per Question (Default)**

Each question should have its own dedicated group. This is the fundamental architecture of the system.

```
Template
  └── Section
      ├── Group 1
      │   └── Question 1
      ├── Group 2
      │   └── Question 2
      └── Group 3
          └── Question 3
```

### Why This Architecture?

1. **Flexibility**: Each question can have independent conditional logic (showIf)
2. **Clean Data Model**: Clear 1:1 relationship between groups and questions
3. **Scalability**: Easy to add conditions without restructuring
4. **Maintainability**: Each question's behavior is isolated

## When to Group Multiple Questions Together

Groups should **only** contain multiple questions when they have **conceptual alignment**:

### ✅ Good Use Cases for Multi-Question Groups:

```typescript
// Example 1: Address fields that always appear together
{
  title: "Address Information Group",
  questions: [
    "Street Address",
    "City",
    "State",
    "Zip Code"
  ]
}

// Example 2: Credit card fields
{
  title: "Payment Information",
  questions: [
    "Card Number",
    "Expiration Date",
    "CVV"
  ]
}
```

### ❌ Bad Use Cases:

```typescript
// BAD: Unrelated questions in one group
{
  title: "All Questions",  // ❌ Don't do this!
  questions: [
    "Company Name",
    "Email Address",
    "Do you want vendor upload?",
    "Upload file"
  ]
}
```

## showIf Conditional Logic

### Structure

Groups support conditional visibility using the `showIf` field:

```typescript
{
  title: "Upload Instructions",
  showIf: {
    question: "64f906be8ef6276e7de91aa0",  // Question ID
    equalTo: "Yes"                          // Expected answer
  },
  questions: ["uploadInstructions"]
}
```

### How It Works

1. **Reference Question**: The group references another question by ID
2. **Condition**: The group only shows if that question equals a specific value
3. **Dynamic Forms**: This creates dynamic, conditional form flows

### Example Flow

```
Question 1: "Would you like to upload vendors?"
  Options: ["Yes", "No"]

↓ (if answer = "Yes")

Question 2: "Please upload your vendor list"
  Type: File Upload
```

Implementation:

```typescript
// Question 1 (always shown)
const q1Group = {
  title: "Vendor Upload Question",
  order: 1,
  questions: [q1.id], // "Would you like to upload vendors?"
};

// Question 2 (conditional)
const q2Group = {
  title: "Vendor Upload Field",
  order: 2,
  showIf: {
    question: q1.id,
    equalTo: "Yes",
  },
  questions: [q2.id], // "Please upload your vendor list"
};
```

## Data Structure Reference

### Template

```typescript
{
  name: string,
  description: string,
  sections: string[]  // Array of Section IDs
}
```

### Section

```typescript
{
  title: string,
  description: string,
  order: number,
  groups: string[]  // Array of Group IDs
}
```

### Group

```typescript
{
  title: string,
  order: number,
  showIf?: {
    question: string,  // Question ID to check
    equalTo: string    // Value to match
  },
  questions: string[]  // Array of Question IDs (usually 1)
}
```

### Question

```typescript
{
  title: string,
  label: string,
  order: number,
  required: boolean,
  type: 'text' | 'number' | 'select' | 'date' | 'image' | 'checkbox',
  selectOptions?: Array<{ value: string }>
}
```

## Migration from Old Architecture

### Old (Incorrect) Architecture

```typescript
// ❌ All questions in one group
const group = await payload.create({
  collection: "groups",
  data: { title: "Main Group", order: 1 },
});

// Create all questions
for (const q of questions) {
  const question = await payload.create({
    collection: "questions",
    data: q,
  });
  questionIds.push(question.id);
}

// Update group with all questions
await payload.update({
  collection: "groups",
  id: group.id,
  data: { questions: questionIds }, // ❌ Wrong!
});
```

### New (Correct) Architecture

```typescript
// ✅ One group per question
const groupIds = [];

for (const q of questions) {
  // Create question
  const question = await payload.create({
    collection: "questions",
    data: q,
  });

  // Create dedicated group for this question
  const group = await payload.create({
    collection: "groups",
    data: {
      title: `Group for: ${q.title}`,
      order: q.order,
      questions: [question.id], // ✅ One question per group
    },
  });

  groupIds.push(group.id);
}

// Link all groups to section
await payload.update({
  collection: "sections",
  id: section.id,
  data: { groups: groupIds },
});
```

## Seeder Scripts

### Basic Seeder (`seed.ts`)

- Creates 1 group per question
- No conditional logic
- Simple, straightforward import

```bash
npm run seed
```

### Advanced Seeder with showIf (`seed-with-showif.ts`)

- Creates 1 group per question
- Supports conditional logic
- Parses showIf from JotForm data (if available)

```bash
npm run seed:showif
```

## Best Practices

### ✅ DO:

1. Create one group per question by default
2. Use descriptive group titles: `"Group for: [Question Title]"`
3. Set group order to match question order
4. Use showIf for conditional questions
5. Keep conceptually related questions together (addresses, payment info)

### ❌ DON'T:

1. Put all questions in a single group
2. Create groups without questions
3. Share groups across sections
4. Use circular showIf dependencies
5. Group unrelated questions together

## Examples from test.json

```json
{
  "groups": [
    {
      "title": "קבוצה אנונימית", // Anonymous Group
      "showIf": {
        "question": "68f906be8ef6276e7de91aa0",
        "equalTo": "שלוםם"
      },
      "questions": [
        {
          "title": "מה שלומך",
          "type": "text"
        }
      ]
    }
  ]
}
```

This shows:

- Group with conditional logic
- Single question per group
- showIf referencing another question

## Debugging Tips

### Issue: Questions not showing

**Check:**

1. Is each question in its own group? ✓
2. Are groups linked to section? ✓
3. Is showIf condition met? ✓
4. Does referenced question ID exist? ✓

### Issue: Conditional logic not working

**Check:**

1. Is showIf.question a valid question ID?
2. Does the equalTo value match exactly?
3. Is the referenced question appearing before the conditional group?

### Verification

```bash
# Run verification script
npm run seed:verify

# Should show:
# - Each group has 1 question
# - All groups linked to section
# - Conditional groups have showIf set
```

## Summary

🎯 **Key Takeaway**: Default to **1 group per question**. Only deviate when questions are conceptually aligned and should always appear/behave together.

📝 **Remember**: Groups are the unit of conditional logic, not questions. Each group can be shown/hidden independently.

✅ **Result**: Clean, maintainable, flexible form architecture that supports complex conditional flows.

---

**Last Updated**: October 22, 2025  
**Version**: 2.0 (Architecture Revision)
