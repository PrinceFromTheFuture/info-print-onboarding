import "dotenv/config"; // if using ES modules
import fs from "fs";
import path from "path";
import { getPayload } from "./db/getPayload.js";
import { auth } from "./auth.js";
const payload = await getPayload;

const migrator = async () => {
  const payload = await getPayload;
  await payload.delete({
    collection: "assignments",
    where: {},
  });
  console.log("Assignments deleted successfully");
  await payload.delete({
    collection: "templates",
    where: {},
  });
  console.log("App users deleted successfully");
};

const seedAdminUser = async () => {
  const { docs: users } = await payload.find({
    collection: "appUsers",
    where: {
      email: { equals: "admin@gmail.com" },
    },
    pagination: false,
  });
  if (users.length > 0) {
    // system is up there is no seed needed
    return;
  }
  await payload.create({
    collection: "appUsers",
    //@ts-ignore
    data: { email: "admin@gmail.com", name: "Admin", role: "admin", isApproved: true },
  });

  await auth.api.signUpEmail({ body: { email: "admin@gmail.com", password: "123123123", name: "Admin" } });
};

const mapJotFormTypeToPayloadType = (jotformField: any) => {
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
      // @ts-ignore

      const options = jotformField.options
      //@ts-ignore
        ? jotformField.options.split("|").map((opt) => ({ value: opt.trim() }))
        : [];
      return { type: "select", selectOptions: options };
    case "control_checkbox":
      // Parse options from field.options (e.g., "Option1|Option2|Option3")
      const checkboxOptions = jotformField.options
        ? jotformField.options.split("|").map((opt: string) => opt.trim())
        : [];
      return {
        type: "checkbox_group",
        checkboxOptions: checkboxOptions,
        isMultipleChoice: true,
      };
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
      // Check if this widget is a YouTube video
      // @ts-ignore
      if (jotformField.URL || jotformField.url) {
        // @ts-ignore
        const youtubeUrl = jotformField.URL || jotformField.url;
        return {
          type: "attachment",
          defaultValue: youtubeUrl,
        };
      }
      // Skip other widgets (instructional content, embeds, etc.)
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
// Function to seed a single JotForm JSON file
// @ts-ignore
const seedJotFormFile = async (jotformJson, fileName) => {
  console.log(`🚀 Processing file: ${fileName}\n`);
  // Validate input
  const content = jotformJson.content;
  if (!content || typeof content !== "object") {
    throw new Error(`Invalid JotForm JSON in ${fileName}: missing or invalid content object`);
  }
  // Step 1: Extract and map JotForm fields to Question data
  console.log("📝 Step 1: Processing JotForm fields...");
  const questionsData: any[] = [];
  const groupData: any[] = [];

  Object.entries(content).forEach(([qid, field]) => {
    const typeMapping = mapJotFormTypeToPayloadType(field);
    // Skip widgets and invalid fields
    if (typeMapping.type === "skip") {
      // @ts-ignore
      console.log(`   ⏩ Skipping widget: ${field.text || qid}`);
      return;
    }
    // @ts-ignore
    const order = parseInt(field.order, 10) || 0;

    // Handle checkbox groups specially
    if (typeMapping.type === "checkbox_group") {
      // @ts-ignore
      const groupTitle = field.text || `Question ${qid}`;
      // @ts-ignore
      const required = field.required === "Yes";

      // Create individual checkbox questions for each option
      const checkboxQuestions = typeMapping.checkboxOptions.map((option: string, index: number) => ({
        qid: `${qid}_${index}`, // Unique ID for each checkbox
        title: option,
        order: order + index * 0.1, // Slight offset to maintain order
        label: option,
        required: false, // Individual checkboxes are not required
        type: "checkbox",
        parentQid: qid, // Reference to original question
        groupTitle: groupTitle,
        isPartOfGroup: true,
        // @ts-ignore
        defaultValue: field.defaultValue || "",
      }));

      groupData.push({
        qid,
        title: groupTitle,
        order,
        required: false,
        questions: checkboxQuestions,
      });

      console.log(`   ✓ Mapped checkbox group: "${groupTitle}" with ${checkboxQuestions.length} options`);
    } else {
      // Regular single question
      const questionData = {
        qid, // Keep original JotForm question ID for reference
        // @ts-ignore
        title: field.text || `Question ${qid}`,
        order,
        // @ts-ignore
        label: field.text || "",
        // @ts-ignore
        required: false,
        type: typeMapping.type,
        selectOptions: typeMapping.selectOptions,
        isPartOfGroup: false,
        // @ts-ignore
        // Use defaultValue from typeMapping (for youtube URLs) or from field
        defaultValue: typeMapping.defaultValue || field.defaultValue || "",
      };
      questionsData.push(questionData);
      if (questionData.type === "attachment" && questionData.defaultValue?.includes("youtu")) {
        console.log(`   ✓ Mapped YouTube video as attachment: "${questionData.title}" (URL: ${questionData.defaultValue})`);
      } else {
        console.log(`   ✓ Mapped field: "${questionData.title}" (type: ${questionData.type}, order: ${order})`);
      }
    }
  });

  // Sort all questions by order
  questionsData.sort((a, b) => a.order - b.order);

  // Calculate total questions including checkbox groups
  const totalQuestions =
    questionsData.length + groupData.reduce((sum, group) => sum + group.questions.length, 0);

  if (totalQuestions === 0) {
    console.warn(`⚠️  No valid questions found in ${fileName}; skipping seeding.`);
    return { totalQuestions: 0 };
  }
  console.log(
    `✓ Processed ${questionsData.length} regular questions and ${groupData.length} checkbox groups (${totalQuestions} total questions)\n`
  );
  try {
    // Step 2: Create Template
    console.log("📦 Step 2: Creating Template...");
    const template = await payload.create({
      collection: "templates",
      data: {
        name: jotformJson.title,
        description: jotformJson.description,
      },
    });
    console.log(`✓ Template created with ID: ${template.id}\n`);
    // Step 3: Create Section
    console.log("📑 Step 3: Creating Section...");
    const section = await payload.create({
      collection: "sections",
      data: {
        title: jotformJson.title,
        description: jotformJson.description,
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
    // Step 5: Create Questions, Groups, and link them
    console.log("📂 Step 5: Creating Questions with their Groups...");
    console.log(
      "   (Regular questions get individual groups, checkbox groups get one group with multiple questions)\n"
    );
    const groupIds = [];
    const questionMap = new Map(); // Map to store question ID by qid for showIf references
    let successCount = 0;
    let failCount = 0;

    // Process regular questions (one group per question)
    for (const qData of questionsData) {
      try {
        // Create the question first
        const { qid, ...questionDataWithoutQid } = qData;
        const question = await payload.create({
          collection: "questions",
          // @ts-ignore
          data: questionDataWithoutQid,
        });
        // Store question ID for potential showIf references
        questionMap.set(qid, question.id);
        console.log(`   ✓ Created question ${successCount + 1}: "${qData.title}"`);
        // Create a group for this specific question
        const group = await payload.create({
          collection: "groups",
          data: {
            title: `${qData.title}`,
            order: qData.order,
            questions: [question.id], // Each group has exactly one question
          },
        });
        groupIds.push(group.id);
        successCount++;
        console.log(`   ✓ Created group for question: "${qData.title}"`);
      } catch (err) {
        failCount++;
        console.error(`   ✗ Failed to create question/group: "${qData.title}"`, err);
      }
    }

    // Process checkbox groups (one group with multiple questions)
    for (const groupInfo of groupData) {
      try {
        console.log(
          `   📋 Creating checkbox group: "${groupInfo.title}" with ${groupInfo.questions.length} options`
        );

        // Create all questions for this checkbox group
        const questionIds = [];
        for (const qData of groupInfo.questions) {
          const { qid, ...questionDataWithoutQid } = qData;
          const question = await payload.create({
            collection: "questions",
            // @ts-ignore
            data: questionDataWithoutQid,
          });
          questionIds.push(question.id);
          questionMap.set(qid, question.id);
          successCount++;
        }

        // Create one group for all checkbox questions
        const group = await payload.create({
          collection: "groups",
          data: {
            title: groupInfo.title,
            order: groupInfo.order,
            questions: questionIds, // All checkbox questions in one group
          },
        });
        groupIds.push(group.id);
        console.log(`   ✓ Created checkbox group with ${questionIds.length} questions: "${groupInfo.title}"`);
      } catch (err) {
        failCount += groupInfo.questions.length;
        console.error(`   ✗ Failed to create checkbox group: "${groupInfo.title}"`, err);
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
    // Final summary for this file
    console.log(`✅ Seeding completed for ${fileName}!\n`);
    console.log("📊 Summary:");
    console.log(`   - Template ID: ${template.id}`);
    console.log(`   - Section ID: ${section.id}`);
    console.log(
      `   - Groups Created: ${groupIds.length} (${questionsData.length} regular + ${groupData.length} checkbox groups)`
    );
    console.log(`   - Questions Created: ${successCount}`);
    console.log(`   - Questions Failed: ${failCount}`);
    console.log(`   - Total Questions Processed: ${totalQuestions}`);
    // Return summary for validation
    return {
      fileName,
      templateId: template.id,
      sectionId: section.id,
      groupIds,
      totalGroups: groupIds.length,
      totalQuestions: totalQuestions,
      successCount,
      failCount,
    };
  } catch (err) {
    console.error(`❌ Seeding failed for ${fileName}:`, err);
    throw err;
  }
};
// Function to process all JSON files in the forms directory
const seedAllForms = async () => {
  console.log("═══════════════════════════════════════════════════");
  console.log("  Batch JotForm to Payload CMS Seeder");
  console.log("  Processing all forms from /forms directory");
  console.log("═══════════════════════════════════════════════════\n");
  const formsDir = path.join(process.cwd(), "forms");
  try {
    // Read all JSON files from the forms directory
    const files = fs.readdirSync(formsDir).filter((file) => file.endsWith(".json"));
    if (files.length === 0) {
      console.log("⚠️  No JSON files found in the forms directory");
      return;
    }
    console.log(`📁 Found ${files.length} JSON files to process\n`);
    const results = [];
    let totalTemplates = 0;
    let totalSections = 0;
    let totalGroups = 0;
    let totalQuestions = 0;
    let successCount = 0;
    let failCount = 0;
    // Process each file
    for (const file of files) {
      try {
        console.log(`\n🔄 Processing ${file}...`);
        const filePath = path.join(formsDir, file);
        const fileContent = fs.readFileSync(filePath, "utf8");
        const jotformJson = JSON.parse(fileContent);
        const result = await seedJotFormFile(jotformJson, file);
        results.push(result);
        totalTemplates++;
        totalSections++;
        totalGroups += result.totalGroups || 0;
        totalQuestions += result.totalQuestions || 0;
        successCount += result.successCount || 0;
        failCount += result.failCount || 0;
        console.log(`✅ Successfully processed ${file}`);
      } catch (error) {
        console.error(`❌ Failed to process ${file}:`, error);
        failCount++;
      }
    }
    // Final summary
    console.log("\n═══════════════════════════════════════════════════");
    console.log("  Batch Seeding Process Complete! ✅");
    console.log("═══════════════════════════════════════════════════");
    console.log("📊 Final Summary:");
    console.log(`   - Files Processed: ${files.length}`);
    console.log(`   - Templates Created: ${totalTemplates}`);
    console.log(`   - Sections Created: ${totalSections}`);
    console.log(`   - Groups Created: ${totalGroups}`);
    console.log(`   - Questions Created: ${successCount}`);
    console.log(`   - Questions Failed: ${failCount}`);
    console.log(`   - Total Questions Processed: ${totalQuestions}`);
    console.log("═══════════════════════════════════════════════════\n");
    return results;
  } catch (error) {
    console.error("\n═══════════════════════════════════════════════════");
    console.error("  Batch Seeding Process Failed! ❌");
    console.error("═══════════════════════════════════════════════════");
    console.error(error);
    throw error;
  }
};
// Run the batch seeder
try {
  await seedAdminUser();
  await seedAllForms();
  console.log("🎉 All forms have been successfully seeded!");
  process.exit(0);
} catch (error) {
  console.error("💥 Batch seeding failed:", error);
  process.exit(1);
}
