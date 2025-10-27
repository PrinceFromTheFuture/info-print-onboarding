import 'dotenv/config'; // if using ES modules
import fs from "fs";
import path from "path";
import { getPayload } from "./db/getPayload.js";
import { auth } from './auth.js';
const payload = await getPayload;

const seedAdminUser = async () => {
    const user = await payload.create({
        collection: "appUsers",
        data: { email: "amir@gmail.com", name: "Admin", role: "admin" },
    });
    await auth.api.signUpEmail({ body: { email: "amir@gmail.com", password: "123123123", name: "Admin" } });
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

            const options = jotformField.options ? jotformField.options.split("|").map((opt) => ({ value: opt.trim() })) : [];
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
    const questionsData = Object.entries(content)
        .map(([qid, field]) => {
        const typeMapping = mapJotFormTypeToPayloadType(field);
        // Skip widgets and invalid fields
        if (typeMapping.type === "skip") {
// @ts-ignore

            console.log(`   ⏩ Skipping widget: ${field.text || qid}`);
            return null;
        }
// @ts-ignore

        const order = parseInt(field.order, 10) || 0;
        const questionData = {
            qid, // Keep original JotForm question ID for reference
// @ts-ignore

            title: field.text || `Question ${qid}`,
            order,
// @ts-ignore

            label: field.text || "",
// @ts-ignore

            required: field.required === "Yes",
            type: typeMapping.type,
            selectOptions: typeMapping.selectOptions,
        };
        console.log(`   ✓ Mapped field: "${questionData.title}" (type: ${questionData.type}, order: ${order})`);
        return questionData;
    })
        .filter((q) => q !== null) // Remove skipped fields
        .sort((a, b) => a.order - b.order); // Sort by order
    if (questionsData.length === 0) {
        console.warn(`⚠️  No valid questions found in ${fileName}; skipping seeding.`);
        return { totalQuestions: 0 };
    }
    console.log(`✓ Processed ${questionsData.length} questions\n`);
    try {
        // Step 2: Create Template
        console.log("📦 Step 2: Creating Template...");
        const template = await payload.create({
            collection: "templates",
            data: {
                name: jotformJson.title || `Form from ${fileName}`,
                description: `Form imported from ${fileName}`,
            },
        });
        console.log(`✓ Template created with ID: ${template.id}\n`);
        // Step 3: Create Section
        console.log("📑 Step 3: Creating Section...");
        const section = await payload.create({
            collection: "sections",
            data: {
                title: `Section from ${fileName}`,
                description: `Complete this section from ${fileName}.`,
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
        const groupIds = [];
        const questionMap = new Map(); // Map to store question ID by qid for showIf references
        let successCount = 0;
        let failCount = 0;
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
                console.log(`   ✓ Created question ${successCount + 1}/${questionsData.length}: "${qData.title}"`);
                // Create a group for this specific question
                const group = await payload.create({
                    collection: "groups",
                    data: {
                        title: `Group for: ${qData.title}`,
                        order: qData.order,
                        questions: [question.id], // Each group has exactly one question
                    },
                });
                groupIds.push(group.id);
                successCount++;
                console.log(`   ✓ Created group ${successCount} for question: "${qData.title}"`);
            }
            catch (err) {
                failCount++;
                console.error(`   ✗ Failed to create question/group: "${qData.title}"`, err);
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
        }
        else {
            console.warn("⚠️  No groups to link to Section\n");
        }
        // Final summary for this file
        console.log(`✅ Seeding completed for ${fileName}!\n`);
        console.log("📊 Summary:");
        console.log(`   - Template ID: ${template.id}`);
        console.log(`   - Section ID: ${section.id}`);
        console.log(`   - Groups Created: ${groupIds.length} (1 per question)`);
        console.log(`   - Questions Created: ${successCount}`);
        console.log(`   - Questions Failed: ${failCount}`);
        console.log(`   - Total Questions Processed: ${questionsData.length}`);
        // Return summary for validation
        return {
            fileName,
            templateId: template.id,
            sectionId: section.id,
            groupIds,
            totalGroups: groupIds.length,
            totalQuestions: questionsData.length,
            successCount,
            failCount,
        };
    }
    catch (err) {
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
            }
            catch (error) {
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
    }
    catch (error) {
        console.error("\n═══════════════════════════════════════════════════");
        console.error("  Batch Seeding Process Failed! ❌");
        console.error("═══════════════════════════════════════════════════");
        console.error(error);
        throw error;
    }
};
// Run the batch seeder
try {
    const results = await seedAllForms();
    await seedAdminUser();
    console.log("🎉 All forms have been successfully seeded!");
    process.exit(0);
}
catch (error) {
    console.error("💥 Batch seeding failed:", error);
    process.exit(1);
}
