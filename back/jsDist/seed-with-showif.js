// Advanced Seeder with showIf Conditional Logic Support
// This demonstrates how to implement conditional group visibility
//
// Architecture:
// - Each question gets its own group
// - Groups can have showIf conditions that reference other questions
// - showIf format: { question: questionId, equalTo: "value" }
import { getPayload } from "./src/db/getPayload";
import jotformJson from "./jotform.json";
const payload = await getPayload;
// Enhanced type mapping (same as base seed.ts)
const mapJotFormTypeToPayloadType = (jotformField) => {
    const fieldType = jotformField.type;
    switch (fieldType) {
        case "control_textbox":
            return { type: "text" };
        case "control_textarea":
            return { type: "text" };
        case "control_email":
            return { type: "text" };
        case "control_phone":
            return { type: "text" };
        case "control_number":
            return { type: "number" };
        case "control_yesno":
            return {
                type: "select",
                selectOptions: [{ value: "Yes" }, { value: "No" }],
            };
        case "control_dropdown":
        case "control_radio":
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
            return { type: "text" };
        case "control_widget":
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
            return { type: "text" };
    }
};
// Parse conditional logic from JotForm field (if available)
const parseShowIfCondition = (field) => {
    // JotForm might have conditional logic in field properties
    // This is a placeholder - actual implementation depends on JotForm's conditional logic format
    if (field.conditionalLogic || field.showIf) {
        // Parse the condition if it exists in the JotForm data
        return {
            dependsOn: field.conditionalLogic?.questionId || field.showIf?.questionId,
            equalTo: field.conditionalLogic?.value || field.showIf?.value,
        };
    }
    return null;
};
const jotformToPayloadSeederWithShowIf = async (jotformJson, payload) => {
    console.log("🚀 Starting Advanced JotForm to Payload seeding with showIf support...\n");
    const content = jotformJson.content;
    if (!content || typeof content !== "object") {
        throw new Error("Invalid JotForm JSON: missing or invalid content object");
    }
    console.log("📝 Step 1: Processing JotForm fields...");
    const questionsData = Object.entries(content)
        .map(([qid, field]) => {
        const typeMapping = mapJotFormTypeToPayloadType(field);
        if (typeMapping.type === "skip") {
            console.log(`   ⏩ Skipping widget: ${field.text || qid}`);
            return null;
        }
        const order = parseInt(field.order, 10) || 0;
        const showIfCondition = parseShowIfCondition(field);
        return {
            qid,
            title: field.text || `Question ${qid}`,
            order,
            label: field.text || "",
            required: field.required === "Yes",
            type: typeMapping.type,
            selectOptions: typeMapping.selectOptions,
            showIf: showIfCondition, // Include conditional logic if present
        };
    })
        .filter((q) => q !== null)
        .sort((a, b) => a.order - b.order);
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
                description: "Form with conditional logic support",
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
        // Step 4: Link Section to Template
        console.log("🔗 Step 4: Linking Section to Template...");
        await payload.update({
            collection: "templates",
            id: template.id,
            data: { sections: [section.id] },
        });
        console.log(`✓ Section linked to Template\n`);
        // Step 5: Create Questions and Groups with showIf support
        console.log("📂 Step 5: Creating Questions with Groups (including showIf conditions)...\n");
        const groupIds = [];
        const questionMap = new Map(); // Map qid -> question ID
        let successCount = 0;
        let conditionalGroupsCount = 0;
        // First pass: Create all questions
        for (const qData of questionsData) {
            try {
                const { qid, showIf, ...questionDataWithoutQid } = qData;
                const question = await payload.create({
                    collection: "questions",
                    data: questionDataWithoutQid,
                });
                questionMap.set(qid, question.id);
                console.log(`   ✓ Created question ${successCount + 1}/${questionsData.length}: "${qData.title}"`);
                // Store question data for second pass
                qData.createdQuestionId = question.id;
                successCount++;
            }
            catch (err) {
                console.error(`   ✗ Failed to create question: "${qData.title}"`, err);
            }
        }
        console.log("\n   Creating groups with conditional logic...\n");
        // Second pass: Create groups with showIf conditions
        for (const qData of questionsData) {
            if (!qData.createdQuestionId)
                continue;
            try {
                const groupData = {
                    title: `Group for: ${qData.title}`,
                    order: qData.order,
                    questions: [qData.createdQuestionId],
                };
                // Add showIf condition if present
                if (qData.showIf && qData.showIf.dependsOn) {
                    const dependentQuestionId = questionMap.get(qData.showIf.dependsOn);
                    if (dependentQuestionId) {
                        groupData.showIf = {
                            question: dependentQuestionId,
                            equalTo: qData.showIf.equalTo,
                        };
                        conditionalGroupsCount++;
                        console.log(`   🔀 Group has condition: Show if Q${qData.showIf.dependsOn} = "${qData.showIf.equalTo}"`);
                    }
                }
                const group = await payload.create({
                    collection: "groups",
                    data: groupData,
                });
                groupIds.push(group.id);
                console.log(`   ✓ Created group for: "${qData.title}"`);
            }
            catch (err) {
                console.error(`   ✗ Failed to create group for: "${qData.title}"`, err);
            }
        }
        // Step 6: Link all groups to section
        console.log(`\n🔗 Step 6: Linking ${groupIds.length} Groups to Section...`);
        if (groupIds.length > 0) {
            await payload.update({
                collection: "sections",
                id: section.id,
                data: { groups: groupIds },
            });
            console.log(`✓ Linked ${groupIds.length} groups to Section\n`);
        }
        // Final summary
        console.log("✅ Seeding completed successfully!\n");
        console.log("📊 Summary:");
        console.log(`   - Template ID: ${template.id}`);
        console.log(`   - Section ID: ${section.id}`);
        console.log(`   - Total Groups: ${groupIds.length}`);
        console.log(`   - Conditional Groups: ${conditionalGroupsCount}`);
        console.log(`   - Questions Created: ${successCount}`);
        console.log(`   - Architecture: 1 Group per Question with showIf support ✓`);
        return {
            templateId: template.id,
            sectionId: section.id,
            groupIds,
            totalGroups: groupIds.length,
            conditionalGroups: conditionalGroupsCount,
            totalQuestions: successCount,
        };
    }
    catch (err) {
        console.error("❌ Seeding failed:", err);
        throw err;
    }
};
// Run the seeder
console.log("═══════════════════════════════════════════════════");
console.log("  Advanced JotForm Seeder with showIf Support");
console.log("  (1 Group per Question + Conditional Logic)");
console.log("═══════════════════════════════════════════════════\n");
try {
    const result = await jotformToPayloadSeederWithShowIf(jotformJson, payload);
    console.log("\n═══════════════════════════════════════════════════");
    console.log("  Seeding Process Complete! ✅");
    console.log("═══════════════════════════════════════════════════");
    process.exit(0);
}
catch (error) {
    console.error("\n═══════════════════════════════════════════════════");
    console.error("  Seeding Process Failed! ❌");
    console.error("═══════════════════════════════════════════════════");
    console.error(error);
    process.exit(1);
}
