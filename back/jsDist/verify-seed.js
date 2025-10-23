// Verification script to check if seeding was successful
// This script queries the database to verify all relationships are correct
import { getPayload } from "./src/db/getPayload";
const payload = await getPayload;
const verifySeeding = async () => {
    console.log("🔍 Starting verification process...\n");
    try {
        // Step 1: Verify Templates
        console.log("1️⃣  Verifying Templates...");
        const templates = await payload.find({
            collection: "templates",
            depth: 3, // Deep populate to get nested relationships
        });
        if (templates.docs.length === 0) {
            console.error("❌ No templates found!");
            return false;
        }
        console.log(`✓ Found ${templates.docs.length} template(s)`);
        const template = templates.docs[0];
        console.log(`   - Name: ${template.name}`);
        console.log(`   - Description: ${template.description}`);
        console.log(`   - Sections: ${Array.isArray(template.sections) ? template.sections.length : 0}`);
        // Step 2: Verify Sections
        console.log("\n2️⃣  Verifying Sections...");
        if (!template.sections || template.sections.length === 0) {
            console.error("❌ Template has no sections!");
            return false;
        }
        const section = template.sections[0];
        console.log(`✓ Found section: ${section.title}`);
        console.log(`   - Description: ${section.description}`);
        console.log(`   - Order: ${section.order}`);
        console.log(`   - Groups: ${Array.isArray(section.groups) ? section.groups.length : 0}`);
        // Step 3: Verify Groups
        console.log("\n3️⃣  Verifying Groups...");
        if (!section.groups || section.groups.length === 0) {
            console.error("❌ Section has no groups!");
            return false;
        }
        const group = section.groups[0];
        console.log(`✓ Found group: ${group.title}`);
        console.log(`   - Order: ${group.order}`);
        console.log(`   - Questions: ${Array.isArray(group.questions) ? group.questions.length : 0}`);
        // Step 4: Verify Questions
        console.log("\n4️⃣  Verifying Questions...");
        if (!group.questions || group.questions.length === 0) {
            console.error("❌ Group has no questions!");
            return false;
        }
        console.log(`✓ Found ${group.questions.length} question(s):\n`);
        group.questions.forEach((q, index) => {
            console.log(`   ${index + 1}. "${q.title}"`);
            console.log(`      - Type: ${q.type}`);
            console.log(`      - Required: ${q.required ? "Yes" : "No"}`);
            console.log(`      - Order: ${q.order}`);
            if (q.selectOptions && q.selectOptions.length > 0) {
                console.log(`      - Options: ${q.selectOptions.map((o) => o.value).join(", ")}`);
            }
        });
        // Step 5: Verify data integrity
        console.log("\n5️⃣  Checking data integrity...");
        const allQuestions = await payload.find({
            collection: "questions",
            limit: 1000,
        });
        const allGroups = await payload.find({
            collection: "groups",
            limit: 1000,
        });
        const allSections = await payload.find({
            collection: "sections",
            limit: 1000,
        });
        console.log(`✓ Total Questions in DB: ${allQuestions.totalDocs}`);
        console.log(`✓ Total Groups in DB: ${allGroups.totalDocs}`);
        console.log(`✓ Total Sections in DB: ${allSections.totalDocs}`);
        console.log(`✓ Total Templates in DB: ${templates.totalDocs}`);
        // Check if questions are properly ordered
        const questionsOrdered = group.questions.every((q, i) => {
            return i === 0 || q.order >= group.questions[i - 1].order;
        });
        if (questionsOrdered) {
            console.log("✓ Questions are properly ordered");
        }
        else {
            console.warn("⚠️  Questions may not be in correct order");
        }
        console.log("\n✅ All verifications passed!");
        console.log("\n📊 Summary:");
        console.log(`   - Template: "${template.name}"`);
        console.log(`   - Sections: ${template.sections.length}`);
        console.log(`   - Groups: ${section.groups.length}`);
        console.log(`   - Questions: ${group.questions.length}`);
        return true;
    }
    catch (error) {
        console.error("❌ Verification failed:", error);
        return false;
    }
};
// Run verification
console.log("═══════════════════════════════════════════════════");
console.log("  Seed Verification Tool");
console.log("═══════════════════════════════════════════════════\n");
try {
    const success = await verifySeeding();
    console.log("\n═══════════════════════════════════════════════════");
    if (success) {
        console.log("  Verification Complete! ✅");
    }
    else {
        console.log("  Verification Failed! ❌");
    }
    console.log("═══════════════════════════════════════════════════");
    process.exit(success ? 0 : 1);
}
catch (error) {
    console.error("\n❌ Verification error:", error);
    process.exit(1);
}
