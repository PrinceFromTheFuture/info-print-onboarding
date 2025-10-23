// Unit tests for seed.ts components
// Tests individual functions and edge cases
import { getPayload } from "./src/db/getPayload";
const payload = await getPayload;
// Copy of the type mapping function for testing
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
// Test suite
const runUnitTests = () => {
    console.log("🧪 Running Unit Tests...\n");
    const tests = [];
    // Test 1: Map textbox to text
    tests.push({
        name: "Map control_textbox to text",
        description: "Should map textbox control to text type",
        test: () => {
            const result = mapJotFormTypeToPayloadType({ type: "control_textbox" });
            return result.type === "text" && !result.selectOptions;
        },
    });
    // Test 2: Map textarea to text
    tests.push({
        name: "Map control_textarea to text",
        description: "Should map textarea control to text type",
        test: () => {
            const result = mapJotFormTypeToPayloadType({ type: "control_textarea" });
            return result.type === "text";
        },
    });
    // Test 3: Map email to text
    tests.push({
        name: "Map control_email to text",
        description: "Should map email control to text type",
        test: () => {
            const result = mapJotFormTypeToPayloadType({ type: "control_email" });
            return result.type === "text";
        },
    });
    // Test 4: Map phone to text
    tests.push({
        name: "Map control_phone to text",
        description: "Should map phone control to text type",
        test: () => {
            const result = mapJotFormTypeToPayloadType({ type: "control_phone" });
            return result.type === "text";
        },
    });
    // Test 5: Map number to number
    tests.push({
        name: "Map control_number to number",
        description: "Should map number control to number type",
        test: () => {
            const result = mapJotFormTypeToPayloadType({ type: "control_number" });
            return result.type === "number";
        },
    });
    // Test 6: Map yesno to select with options
    tests.push({
        name: "Map control_yesno to select",
        description: "Should map yesno to select with Yes/No options",
        test: () => {
            const result = mapJotFormTypeToPayloadType({ type: "control_yesno" });
            return (result.type === "select" &&
                result.selectOptions?.length === 2 &&
                result.selectOptions[0].value === "Yes" &&
                result.selectOptions[1].value === "No");
        },
    });
    // Test 7: Map dropdown with options
    tests.push({
        name: "Map control_dropdown with options",
        description: "Should parse pipe-separated options",
        test: () => {
            const result = mapJotFormTypeToPayloadType({
                type: "control_dropdown",
                options: "Option1|Option2|Option3",
            });
            return (result.type === "select" &&
                result.selectOptions?.length === 3 &&
                result.selectOptions[0].value === "Option1" &&
                result.selectOptions[2].value === "Option3");
        },
    });
    // Test 8: Map dropdown without options
    tests.push({
        name: "Map control_dropdown without options",
        description: "Should handle dropdown without options",
        test: () => {
            const result = mapJotFormTypeToPayloadType({
                type: "control_dropdown",
            });
            return result.type === "select" && result.selectOptions?.length === 0;
        },
    });
    // Test 9: Map checkbox to checkbox
    tests.push({
        name: "Map control_checkbox to checkbox",
        description: "Should map checkbox control to checkbox type",
        test: () => {
            const result = mapJotFormTypeToPayloadType({ type: "control_checkbox" });
            return result.type === "checkbox";
        },
    });
    // Test 10: Map fileupload to image
    tests.push({
        name: "Map control_fileupload to image",
        description: "Should map fileupload control to image type",
        test: () => {
            const result = mapJotFormTypeToPayloadType({ type: "control_fileupload" });
            return result.type === "image";
        },
    });
    // Test 11: Map datetime to date
    tests.push({
        name: "Map control_datetime to date",
        description: "Should map datetime control to date type",
        test: () => {
            const result = mapJotFormTypeToPayloadType({ type: "control_datetime" });
            return result.type === "date";
        },
    });
    // Test 12: Map date to date
    tests.push({
        name: "Map control_date to date",
        description: "Should map date control to date type",
        test: () => {
            const result = mapJotFormTypeToPayloadType({ type: "control_date" });
            return result.type === "date";
        },
    });
    // Test 13: Map fullname to text
    tests.push({
        name: "Map control_fullname to text",
        description: "Should map compound fullname to text",
        test: () => {
            const result = mapJotFormTypeToPayloadType({ type: "control_fullname" });
            return result.type === "text";
        },
    });
    // Test 14: Map address to text
    tests.push({
        name: "Map control_address to text",
        description: "Should map compound address to text",
        test: () => {
            const result = mapJotFormTypeToPayloadType({ type: "control_address" });
            return result.type === "text";
        },
    });
    // Test 15: Skip widgets
    tests.push({
        name: "Skip control_widget",
        description: "Should mark widgets for skipping",
        test: () => {
            const result = mapJotFormTypeToPayloadType({ type: "control_widget" });
            return result.type === "skip";
        },
    });
    // Test 16: Default unknown types to text
    tests.push({
        name: "Default unknown type to text",
        description: "Should default unknown types to text",
        test: () => {
            const result = mapJotFormTypeToPayloadType({ type: "control_unknown_type" });
            return result.type === "text";
        },
    });
    // Test 17: Handle options with spaces
    tests.push({
        name: "Trim spaces in options",
        description: "Should trim whitespace from options",
        test: () => {
            const result = mapJotFormTypeToPayloadType({
                type: "control_dropdown",
                options: "Option 1 | Option 2 | Option 3",
            });
            return result.selectOptions?.[0].value === "Option 1" && result.selectOptions?.[1].value === "Option 2";
        },
    });
    // Test 18: Handle empty options string
    tests.push({
        name: "Handle empty options string",
        description: "Should handle empty options gracefully",
        test: () => {
            const result = mapJotFormTypeToPayloadType({
                type: "control_dropdown",
                options: "",
            });
            return result.type === "select" && result.selectOptions?.length === 0;
        },
    });
    // Test 19: Handle single option
    tests.push({
        name: "Handle single option",
        description: "Should handle single option correctly",
        test: () => {
            const result = mapJotFormTypeToPayloadType({
                type: "control_dropdown",
                options: "OnlyOption",
            });
            return result.selectOptions?.length === 1 && result.selectOptions[0].value === "OnlyOption";
        },
    });
    // Test 20: Radio maps to select
    tests.push({
        name: "Map control_radio to select",
        description: "Should map radio control to select type",
        test: () => {
            const result = mapJotFormTypeToPayloadType({
                type: "control_radio",
                options: "Radio1|Radio2",
            });
            return result.type === "select" && result.selectOptions?.length === 2;
        },
    });
    // Run all tests
    let passed = 0;
    let failed = 0;
    tests.forEach((test, index) => {
        try {
            const result = test.test();
            if (result) {
                console.log(`✅ Test ${index + 1}/${tests.length}: ${test.name}`);
                console.log(`   ${test.description}`);
                passed++;
            }
            else {
                console.log(`❌ Test ${index + 1}/${tests.length}: ${test.name}`);
                console.log(`   ${test.description}`);
                console.log(`   Expected: true, Got: false`);
                failed++;
            }
        }
        catch (error) {
            console.log(`❌ Test ${index + 1}/${tests.length}: ${test.name} (Exception)`);
            console.log(`   ${test.description}`);
            console.log(`   Error: ${error}`);
            failed++;
        }
    });
    return { total: tests.length, passed, failed };
};
// Integration tests for database operations
const runIntegrationTests = async () => {
    console.log("\n🔗 Running Integration Tests...\n");
    const tests = [];
    // Test 1: Can create a template
    tests.push({
        name: "Create template",
        description: "Should successfully create a template",
        test: async () => {
            try {
                const template = await payload.create({
                    collection: "templates",
                    data: {
                        name: "Test Template",
                        description: "Test Description",
                    },
                });
                // Cleanup
                await payload.delete({ collection: "templates", id: template.id });
                return !!template.id;
            }
            catch (error) {
                return false;
            }
        },
    });
    // Test 2: Can create a section
    tests.push({
        name: "Create section",
        description: "Should successfully create a section",
        test: async () => {
            try {
                const section = await payload.create({
                    collection: "sections",
                    data: {
                        title: "Test Section",
                        description: "Test Description",
                        order: 1,
                    },
                });
                await payload.delete({ collection: "sections", id: section.id });
                return !!section.id;
            }
            catch (error) {
                return false;
            }
        },
    });
    // Test 3: Can create a group
    tests.push({
        name: "Create group",
        description: "Should successfully create a group",
        test: async () => {
            try {
                const group = await payload.create({
                    collection: "groups",
                    data: {
                        title: "Test Group",
                        order: 1,
                    },
                });
                await payload.delete({ collection: "groups", id: group.id });
                return !!group.id;
            }
            catch (error) {
                return false;
            }
        },
    });
    // Test 4: Can create a question
    tests.push({
        name: "Create question",
        description: "Should successfully create a question",
        test: async () => {
            try {
                const question = await payload.create({
                    collection: "questions",
                    data: {
                        title: "Test Question",
                        label: "Test Label",
                        order: 1,
                        required: false,
                        type: "text",
                    },
                });
                await payload.delete({ collection: "questions", id: question.id });
                return !!question.id;
            }
            catch (error) {
                return false;
            }
        },
    });
    // Test 5: Can link section to template
    tests.push({
        name: "Link section to template",
        description: "Should successfully link section to template",
        test: async () => {
            try {
                const template = await payload.create({
                    collection: "templates",
                    data: { name: "Test", description: "Test" },
                });
                const section = await payload.create({
                    collection: "sections",
                    data: { title: "Test", description: "Test", order: 1 },
                });
                await payload.update({
                    collection: "templates",
                    id: template.id,
                    data: { sections: [section.id] },
                });
                const updated = await payload.findByID({
                    collection: "templates",
                    id: template.id,
                });
                await payload.delete({ collection: "sections", id: section.id });
                await payload.delete({ collection: "templates", id: template.id });
                return Array.isArray(updated.sections) && updated.sections.length > 0;
            }
            catch (error) {
                return false;
            }
        },
    });
    let passed = 0;
    let failed = 0;
    for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        try {
            const result = await test.test();
            if (result) {
                console.log(`✅ Test ${i + 1}/${tests.length}: ${test.name}`);
                console.log(`   ${test.description}`);
                passed++;
            }
            else {
                console.log(`❌ Test ${i + 1}/${tests.length}: ${test.name}`);
                console.log(`   ${test.description}`);
                failed++;
            }
        }
        catch (error) {
            console.log(`❌ Test ${i + 1}/${tests.length}: ${test.name} (Exception)`);
            console.log(`   ${test.description}`);
            console.log(`   Error: ${error}`);
            failed++;
        }
    }
    return { total: tests.length, passed, failed };
};
// Run all tests
console.log("═══════════════════════════════════════════════════");
console.log("  Seed Unit & Integration Tests");
console.log("═══════════════════════════════════════════════════\n");
try {
    const unitResults = runUnitTests();
    const integrationResults = await runIntegrationTests();
    console.log("\n═══════════════════════════════════════════════════");
    console.log("  Test Results");
    console.log("═══════════════════════════════════════════════════");
    console.log(`\n📊 Unit Tests:`);
    console.log(`   Total: ${unitResults.total}`);
    console.log(`   Passed: ${unitResults.passed} ✅`);
    console.log(`   Failed: ${unitResults.failed} ❌`);
    console.log(`\n📊 Integration Tests:`);
    console.log(`   Total: ${integrationResults.total}`);
    console.log(`   Passed: ${integrationResults.passed} ✅`);
    console.log(`   Failed: ${integrationResults.failed} ❌`);
    const totalTests = unitResults.total + integrationResults.total;
    const totalPassed = unitResults.passed + integrationResults.passed;
    const totalFailed = unitResults.failed + integrationResults.failed;
    console.log(`\n📊 Overall:`);
    console.log(`   Total: ${totalTests}`);
    console.log(`   Passed: ${totalPassed} ✅`);
    console.log(`   Failed: ${totalFailed} ❌`);
    console.log(`   Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
    if (totalFailed === 0) {
        console.log("\n✅ All tests passed!");
        process.exit(0);
    }
    else {
        console.log("\n❌ Some tests failed!");
        process.exit(1);
    }
}
catch (error) {
    console.error("\n❌ Test execution failed:", error);
    process.exit(1);
}
