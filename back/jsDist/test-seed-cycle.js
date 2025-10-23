// Complete test cycle: cleanup -> seed -> verify
// This script runs a full test of the seeding process
import { getPayload } from "./src/db/getPayload";
import jotformJson from "./jotform.json";
const payload = await getPayload;
// Import the seeder function (inline for testing)
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
const jotformToPayloadSeeder = async (jotformJson, payload) => {
    const content = jotformJson.content;
    if (!content || typeof content !== "object") {
        throw new Error("Invalid JotForm JSON: missing or invalid content object");
    }
    const questionsData = Object.entries(content)
        .map(([qid, field]) => {
        const typeMapping = mapJotFormTypeToPayloadType(field);
        if (typeMapping.type === "skip")
            return null;
        return {
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
        throw new Error("No valid questions found");
    }
    const template = await payload.create({
        collection: "templates",
        data: {
            name: jotformJson.title || "Vendor Onboarding Form",
            description: "Test seeding template",
        },
    });
    const section = await payload.create({
        collection: "sections",
        data: {
            title: "Test Section",
            description: "Test section description",
            order: 1,
        },
    });
    await payload.update({
        collection: "templates",
        id: template.id,
        data: { sections: [section.id] },
    });
    // Create one group per question (correct architecture)
    const groupIds = [];
    for (const qData of questionsData) {
        const question = await payload.create({
            collection: "questions",
            data: qData,
        });
        const group = await payload.create({
            collection: "groups",
            data: {
                title: `Group for: ${qData.title}`,
                order: qData.order,
                questions: [question.id], // Each group has one question
            },
        });
        groupIds.push(group.id);
    }
    await payload.update({
        collection: "sections",
        id: section.id,
        data: { groups: groupIds }, // Link all groups to section
    });
    return {
        templateId: template.id,
        sectionId: section.id,
        groupIds,
        totalGroups: groupIds.length,
        totalQuestions: questionsData.length,
    };
};
// Cleanup function
const cleanup = async () => {
    const collections = ["questions", "groups", "sections", "templates"];
    let totalDeleted = 0;
    for (const collection of collections) {
        const items = await payload.find({ collection, limit: 1000 });
        for (const item of items.docs) {
            await payload.delete({ collection, id: item.id });
            totalDeleted++;
        }
    }
    return totalDeleted;
};
// Verification function
const verify = async () => {
    const templates = await payload.find({
        collection: "templates",
        depth: 3,
    });
    if (templates.docs.length === 0) {
        throw new Error("No templates found");
    }
    const template = templates.docs[0];
    if (!template.sections || template.sections.length === 0) {
        throw new Error("Template has no sections");
    }
    const section = template.sections[0];
    if (!section.groups || section.groups.length === 0) {
        throw new Error("Section has no groups");
    }
    const group = section.groups[0];
    if (!group.questions || group.questions.length === 0) {
        throw new Error("Group has no questions");
    }
    return {
        template: template.name,
        sections: template.sections.length,
        groups: section.groups.length,
        questions: group.questions.length,
    };
};
// Run complete test cycle
console.log("═══════════════════════════════════════════════════");
console.log("  Complete Seed Test Cycle");
console.log("═══════════════════════════════════════════════════\n");
try {
    // Phase 1: Cleanup
    console.log("🧹 Phase 1: Cleanup existing data...");
    const deletedCount = await cleanup();
    console.log(`✓ Cleaned up ${deletedCount} record(s)\n`);
    // Phase 2: Seed
    console.log("🌱 Phase 2: Running seeder...");
    const seedResult = await jotformToPayloadSeeder(jotformJson, payload);
    console.log(`✓ Seeded ${seedResult.totalQuestions} questions`);
    console.log(`✓ Created ${seedResult.totalGroups} groups (1 per question)`);
    console.log(`✓ Template ID: ${seedResult.templateId}\n`);
    // Phase 3: Verify
    console.log("🔍 Phase 3: Verifying seeded data...");
    const verifyResult = await verify();
    console.log(`✓ Template: ${verifyResult.template}`);
    console.log(`✓ Sections: ${verifyResult.sections}`);
    console.log(`✓ Groups: ${verifyResult.groups}`);
    console.log(`✓ Questions: ${verifyResult.questions}\n`);
    // Phase 4: Assertions
    console.log("✅ Phase 4: Running assertions...");
    const assertions = [
        { name: "Questions count matches", pass: verifyResult.questions === seedResult.totalQuestions },
        { name: "Template has sections", pass: verifyResult.sections > 0 },
        { name: "Section has groups", pass: verifyResult.groups > 0 },
        { name: "Group has questions", pass: verifyResult.questions > 0 },
    ];
    let allPassed = true;
    assertions.forEach((assertion) => {
        if (assertion.pass) {
            console.log(`   ✓ ${assertion.name}`);
        }
        else {
            console.log(`   ✗ ${assertion.name}`);
            allPassed = false;
        }
    });
    if (allPassed) {
        console.log("\n═══════════════════════════════════════════════════");
        console.log("  All Tests Passed! ✅");
        console.log("═══════════════════════════════════════════════════");
        process.exit(0);
    }
    else {
        console.log("\n═══════════════════════════════════════════════════");
        console.log("  Some Tests Failed! ❌");
        console.log("═══════════════════════════════════════════════════");
        process.exit(1);
    }
}
catch (error) {
    console.error("\n═══════════════════════════════════════════════════");
    console.error("  Test Cycle Failed! ❌");
    console.error("═══════════════════════════════════════════════════");
    console.error(error);
    process.exit(1);
}
