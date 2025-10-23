// Cleanup script to remove all seeded data
// This script deletes all data from the collections to allow re-seeding
import { getPayload } from "./src/db/getPayload";
const payload = await getPayload;
const cleanupSeededData = async () => {
    console.log("🧹 Starting cleanup process...\n");
    try {
        // Get counts before cleanup
        const templatesCount = await payload.find({ collection: "templates", limit: 0 });
        const sectionsCount = await payload.find({ collection: "sections", limit: 0 });
        const groupsCount = await payload.find({ collection: "groups", limit: 0 });
        const questionsCount = await payload.find({ collection: "questions", limit: 0 });
        console.log("📊 Current state:");
        console.log(`   - Templates: ${templatesCount.totalDocs}`);
        console.log(`   - Sections: ${sectionsCount.totalDocs}`);
        console.log(`   - Groups: ${groupsCount.totalDocs}`);
        console.log(`   - Questions: ${questionsCount.totalDocs}\n`);
        if (templatesCount.totalDocs === 0 && sectionsCount.totalDocs === 0 && groupsCount.totalDocs === 0 && questionsCount.totalDocs === 0) {
            console.log("✓ Database is already clean, nothing to delete.\n");
            return { deleted: 0 };
        }
        let deletedCount = 0;
        // Delete in reverse order to avoid relationship issues
        // 1. Delete Questions
        console.log("1️⃣  Deleting Questions...");
        const questions = await payload.find({ collection: "questions", limit: 1000 });
        for (const question of questions.docs) {
            await payload.delete({ collection: "questions", id: question.id });
            deletedCount++;
        }
        console.log(`✓ Deleted ${questions.docs.length} question(s)\n`);
        // 2. Delete Groups
        console.log("2️⃣  Deleting Groups...");
        const groups = await payload.find({ collection: "groups", limit: 1000 });
        for (const group of groups.docs) {
            await payload.delete({ collection: "groups", id: group.id });
            deletedCount++;
        }
        console.log(`✓ Deleted ${groups.docs.length} group(s)\n`);
        // 3. Delete Sections
        console.log("3️⃣  Deleting Sections...");
        const sections = await payload.find({ collection: "sections", limit: 1000 });
        for (const section of sections.docs) {
            await payload.delete({ collection: "sections", id: section.id });
            deletedCount++;
        }
        console.log(`✓ Deleted ${sections.docs.length} section(s)\n`);
        // 4. Delete Templates
        console.log("4️⃣  Deleting Templates...");
        const templates = await payload.find({ collection: "templates", limit: 1000 });
        for (const template of templates.docs) {
            await payload.delete({ collection: "templates", id: template.id });
            deletedCount++;
        }
        console.log(`✓ Deleted ${templates.docs.length} template(s)\n`);
        console.log(`✅ Cleanup completed! Deleted ${deletedCount} total record(s)`);
        return {
            deleted: deletedCount,
            breakdown: {
                templates: templates.docs.length,
                sections: sections.docs.length,
                groups: groups.docs.length,
                questions: questions.docs.length,
            },
        };
    }
    catch (error) {
        console.error("❌ Cleanup failed:", error);
        throw error;
    }
};
// Run cleanup
console.log("═══════════════════════════════════════════════════");
console.log("  Seed Cleanup Tool");
console.log("═══════════════════════════════════════════════════\n");
try {
    const result = await cleanupSeededData();
    console.log("\n═══════════════════════════════════════════════════");
    console.log("  Cleanup Complete! ✅");
    console.log("═══════════════════════════════════════════════════");
    process.exit(0);
}
catch (error) {
    console.error("\n═══════════════════════════════════════════════════");
    console.error("  Cleanup Failed! ❌");
    console.error("═══════════════════════════════════════════════════");
    console.error(error);
    process.exit(1);
}
