// Batch Seeder for Multiple JotForm JSON Files
// This script processes all forms in the forms/ directory
import { getPayload } from "./src/db/getPayload";
import { readdir } from "fs/promises";
import { join } from "path";
const payload = await getPayload;
// Enhanced type mapping
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
            return { type: "skip" };
        case "control_head":
            return { type: "skip" };
        case "control_text":
            return { type: "skip" };
        default:
            return { type: "text" };
    }
};
// Process a single form
const processForm = async (jotformJson, formName) => {
    console.log(`\n📝 Processing form: ${formName}`);
    console.log("━".repeat(50));
    const content = jotformJson.content;
    if (!content || typeof content !== "object") {
        throw new Error(`Invalid JSON structure in ${formName}`);
    }
    // Extract and map fields
    const questionsData = Object.entries(content)
        .map(([qid, field]) => {
        const typeMapping = mapJotFormTypeToPayloadType(field);
        if (typeMapping.type === "skip") {
            return null;
        }
        return {
            qid,
            title: field.text || `Question ${qid}`,
            order: parseInt(field.order, 10) || 0,
            label: field.text || "",
            required: field.required === "Yes",
            type: typeMapping.type,
            selectOptions: typeMapping.selectOptions,
        };
    })
        .filter((q) => q !== null)
        .sort((a, b) => a.order - b.order);
    if (questionsData.length === 0) {
        console.log(`⚠️  No valid questions in ${formName}, skipping...`);
        return null;
    }
    console.log(`✓ Found ${questionsData.length} questions`);
    // Create Template
    const template = await payload.create({
        collection: "templates",
        data: {
            name: `Form ${formName}`,
            description: `Imported from ${formName}`,
        },
    });
    console.log(`✓ Template created: ${template.id}`);
    // Create Section
    const section = await payload.create({
        collection: "sections",
        data: {
            title: `${formName} Section`,
            description: `Questions from ${formName}`,
            order: 1,
        },
    });
    console.log(`✓ Section created: ${section.id}`);
    // Link Section to Template
    await payload.update({
        collection: "templates",
        id: template.id,
        data: { sections: [section.id] },
    });
    // Create Groups and Questions (1:1)
    const groupIds = [];
    let successCount = 0;
    for (const qData of questionsData) {
        try {
            const { qid, ...questionDataWithoutQid } = qData;
            const question = await payload.create({
                collection: "questions",
                data: questionDataWithoutQid,
            });
            const group = await payload.create({
                collection: "groups",
                data: {
                    title: `Group for: ${qData.title}`,
                    order: qData.order,
                    questions: [question.id],
                },
            });
            groupIds.push(group.id);
            successCount++;
        }
        catch (err) {
            console.error(`   ✗ Failed to create question: "${qData.title}"`, err);
        }
    }
    // Link all groups to section
    await payload.update({
        collection: "sections",
        id: section.id,
        data: { groups: groupIds },
    });
    console.log(`✓ Created ${successCount} questions and groups`);
    console.log(`✓ Form ${formName} completed!`);
    return {
        formName,
        templateId: template.id,
        sectionId: section.id,
        totalGroups: groupIds.length,
        totalQuestions: successCount,
    };
};
// Main batch processor
const batchSeedForms = async () => {
    console.log("═══════════════════════════════════════════════════");
    console.log("  Batch JotForm Seeder");
    console.log("  Processing all forms in forms/ directory");
    console.log("═══════════════════════════════════════════════════\n");
    const formsDir = "./forms";
    const results = [];
    const errors = [];
    try {
        // Read all JSON files from forms directory
        const files = await readdir(formsDir);
        const jsonFiles = files
            .filter((file) => file.endsWith(".json"))
            .sort((a, b) => {
            const numA = parseInt(a.replace(".json", ""));
            const numB = parseInt(b.replace(".json", ""));
            return numA - numB;
        });
        console.log(`📂 Found ${jsonFiles.length} JSON files to process\n`);
        for (const file of jsonFiles) {
            try {
                const filePath = join(formsDir, file);
                const jotformJson = await import(filePath);
                const result = await processForm(jotformJson.default || jotformJson, file);
                if (result) {
                    results.push(result);
                }
            }
            catch (err) {
                console.error(`\n❌ Error processing ${file}:`, err);
                errors.push({ file, error: err });
            }
        }
        // Final Summary
        console.log("\n\n═══════════════════════════════════════════════════");
        console.log("  Batch Seeding Complete!");
        console.log("═══════════════════════════════════════════════════\n");
        console.log("📊 Summary:");
        console.log(`   Total Forms Processed: ${results.length}`);
        console.log(`   Total Forms Failed: ${errors.length}`);
        console.log(`   Total Templates Created: ${results.length}`);
        console.log(`   Total Questions Created: ${results.reduce((sum, r) => sum + r.totalQuestions, 0)}`);
        if (results.length > 0) {
            console.log("\n✅ Successfully Processed Forms:");
            results.forEach((r, i) => {
                console.log(`   ${i + 1}. ${r.formName}: ${r.totalQuestions} questions`);
            });
        }
        if (errors.length > 0) {
            console.log("\n❌ Failed Forms:");
            errors.forEach((e, i) => {
                console.log(`   ${i + 1}. ${e.file}`);
            });
        }
        console.log("\n💡 Each form has been imported as a separate template");
        console.log("💡 Each question has its own group (1:1 architecture)");
        return { results, errors, totalForms: jsonFiles.length };
    }
    catch (err) {
        console.error("❌ Batch seeding failed:", err);
        throw err;
    }
};
// Run batch seeder
try {
    const summary = await batchSeedForms();
    console.log("\n═══════════════════════════════════════════════════");
    if (summary.errors.length === 0) {
        console.log("  All Forms Processed Successfully! ✅");
    }
    else {
        console.log(`  ${summary.results.length}/${summary.totalForms} Forms Processed ⚠️`);
    }
    console.log("═══════════════════════════════════════════════════");
    process.exit(summary.errors.length === 0 ? 0 : 1);
}
catch (error) {
    console.error("\n═══════════════════════════════════════════════════");
    console.error("  Batch Seeding Failed! ❌");
    console.error("═══════════════════════════════════════════════════");
    console.error(error);
    process.exit(1);
}
