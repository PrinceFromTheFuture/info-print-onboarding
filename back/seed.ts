// Comprehensive JotForm to Payload CMS Seeder
// This script imports JotForm data and creates a hierarchical structure:
// Template → Sections → Groups → Questions
//
// Important Architecture:
// - Each question gets its own group (1:1 relationship)
// - Groups are only shared when questions are conceptually aligned
// - Groups support showIf conditional logic
//
// Features:
// - Complete field type mapping from JotForm to Payload
// - One group per question (proper architecture)
// - Comprehensive error handling and logging
// - Validation at each step

import { getPayload } from "./src/db/getPayload";
import jotformJson from "./jotform.json";

const payload = await getPayload;

// Enhanced type mapping from JotForm to Payload question types
const mapJotFormTypeToPayloadType = (jotformField: any): { type: string; selectOptions?: any[] } => {
  const fieldType = jotformField.type;

  switch (fieldType) {
    case "control_textbox":
      return { type: "text" };

    case "control_textarea":
      return { type: "text" }; // Payload doesn't have textarea in questions, use text

    case "control_email":
      return { type: "text" }; // Could add validation later

    case "control_phone":
      return { type: "text" }; // Store as text, could add validation

    case "control_number":
      return { type: "number" };

    case "control_yesno":
      return {
        type: "select",
        selectOptions: [{ value: "Yes" }, { value: "No" }],
      };

    case "control_dropdown":
    case "control_radio":
      // Parse options from field.options (e.g., "Yes|No")
      const options = jotformField.options ? jotformField.options.split("|").map((opt: string) => ({ value: opt.trim() })) : [];
      return { type: "select", selectOptions: options };

    case "control_checkbox":
      return { type: "checkbox" };

    case "control_fileupload":
      return { type: "image" };

    case "control_datetime":
    case "control_date":
      return { type: "date" };

    case "control_fullname":
    case "control_address":
      // Compound fields - treat as text for simplicity
      return { type: "text" };

    case "control_widget":
      // Skip widgets (instructional content, embeds, etc.)
      return { type: "skip" };

    case "control_button":
      // Skip buttons (submit, clear, etc.)
      return { type: "skip" };

    case "control_head":
      // Skip page headers and section breaks
      return { type: "skip" };

    case "control_text":
      // Skip display-only text fields
      return { type: "skip" };

    default:
      console.warn(`Unknown JotForm field type: ${fieldType}, defaulting to text`);
      return { type: "text" };
  }
};

const jotformToPayloadSeeder = async (jotformJson: any, payload: any) => {
  console.log("🚀 Starting JotForm to Payload seeding process...\n");

  // Validate input
  const content = jotformJson.content;
  if (!content || typeof content !== "object") {
    throw new Error("Invalid JotForm JSON: missing or invalid content object");
  }

  // Step 1: Extract and map JotForm fields to Question data
  console.log("📝 Step 1: Processing JotForm fields...");
  const questionsData = Object.entries(content)
    .map(([qid, field]: [string, any]) => {
      const typeMapping = mapJotFormTypeToPayloadType(field);

      // Skip widgets and invalid fields
      if (typeMapping.type === "skip") {
        console.log(`   ⏩ Skipping widget: ${field.text || qid}`);
        return null;
      }

      const order = parseInt(field.order, 10) || 0;
      const questionData = {
        qid, // Keep original JotForm question ID for reference
        title: field.text || `Question ${qid}`,
        order,
        label: field.text || "",
        required: field.required === "Yes",
        type: typeMapping.type,
        selectOptions: typeMapping.selectOptions,
      };

      console.log(`   ✓ Mapped field: "${questionData.title}" (type: ${questionData.type}, order: ${order})`);
      return questionData;
    })
    .filter((q) => q !== null) // Remove skipped fields
    .sort((a, b) => a!.order - b!.order); // Sort by order

  if (questionsData.length === 0) {
    console.warn("⚠️  No valid questions found in JotForm content; skipping seeding.");
    return { totalQuestions: 0 };
  }

  console.log(`✓ Processed ${questionsData.length} questions\n`);

  try {
    // Step 2: Create Template
    console.log("📦 Step 2: Creating Template...");
    const template = await payload.create({
      collection: "templates",
      data: {
        name: jotformJson.title || "Vendor Onboarding Form",
        description: "Form for print shop administrators to provide details, upload vendors, and provide feedback on RFQ workflow.",
      },
    });
    console.log(`✓ Template created with ID: ${template.id}\n`);

    // Step 3: Create Section
    console.log("📑 Step 3: Creating Section...");
    const section = await payload.create({
      collection: "sections",
      data: {
        title: "Vendor Onboarding Section",
        description: "Complete this section to onboard your print shop and vendors.",
        order: 1,
      },
    });
    console.log(`✓ Section created with ID: ${section.id}\n`);

    // Step 4: Update Template with Section relationship
    console.log("🔗 Step 4: Linking Section to Template...");
    await payload.update({
      collection: "templates",
      id: template.id,
      data: {
        sections: [section.id], // Use direct ID, not polymorphic format
      },
    });
    console.log(`✓ Section linked to Template\n`);

    // Step 5: Create Questions, Groups, and link them (1 group per question)
    console.log("📂 Step 5: Creating Questions with their Groups...");
    console.log("   (Each question gets its own group for proper architecture)\n");

    const groupIds: string[] = [];
    const questionMap = new Map(); // Map to store question ID by qid for showIf references
    let successCount = 0;
    let failCount = 0;

    for (const qData of questionsData) {
      try {
        // Create the question first
        const { qid, ...questionDataWithoutQid } = qData!;
        const question = await payload.create({
          collection: "questions",
          data: questionDataWithoutQid,
        });

        // Store question ID for potential showIf references
        questionMap.set(qid, question.id);

        console.log(`   ✓ Created question ${successCount + 1}/${questionsData.length}: "${qData!.title}"`);

        // Create a group for this specific question
        const group = await payload.create({
          collection: "groups",
          data: {
            title: `Group for: ${qData!.title}`,
            order: qData!.order,
            questions: [question.id], // Each group has exactly one question
          },
        });

        groupIds.push(group.id);
        successCount++;
        console.log(`   ✓ Created group ${successCount} for question: "${qData!.title}"`);
      } catch (err) {
        failCount++;
        console.error(`   ✗ Failed to create question/group: "${qData!.title}"`, err);
      }
    }

    // Step 6: Update Section with all Group IDs
    console.log(`\n🔗 Step 6: Linking ${groupIds.length} Groups to Section...`);
    if (groupIds.length > 0) {
      await payload.update({
        collection: "sections",
        id: section.id,
        data: {
          groups: groupIds, // Link all groups to the section
        },
      });
      console.log(`✓ Linked ${groupIds.length} groups to Section\n`);
    } else {
      console.warn("⚠️  No groups to link to Section\n");
    }

    // Final summary
    console.log("✅ Seeding completed successfully!\n");
    console.log("📊 Summary:");
    console.log(`   - Template ID: ${template.id}`);
    console.log(`   - Section ID: ${section.id}`);
    console.log(`   - Groups Created: ${groupIds.length} (1 per question)`);
    console.log(`   - Questions Created: ${successCount}`);
    console.log(`   - Questions Failed: ${failCount}`);
    console.log(`   - Total Questions Processed: ${questionsData.length}`);
    console.log(`\n💡 Architecture Note: Each question has its own group for proper data modeling`);

    // Return summary for validation
    return {
      templateId: template.id,
      sectionId: section.id,
      groupIds,
      totalGroups: groupIds.length,
      totalQuestions: questionsData.length,
      successCount,
      failCount,
    };
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    throw err;
  }
};

// Run the seeder
console.log("═══════════════════════════════════════════════════");
console.log("  JotForm to Payload CMS Seeder");
console.log("  (1 Group per Question Architecture)");
console.log("═══════════════════════════════════════════════════\n");

try {
  const result = await jotformToPayloadSeeder(jotformJson, payload);
  console.log("\n═══════════════════════════════════════════════════");
  console.log("  Seeding Process Complete! ✅");
  console.log("═══════════════════════════════════════════════════");
  process.exit(0);
} catch (error) {
  console.error("\n═══════════════════════════════════════════════════");
  console.error("  Seeding Process Failed! ❌");
  console.error("═══════════════════════════════════════════════════");
  console.error(error);
  process.exit(1);
}
