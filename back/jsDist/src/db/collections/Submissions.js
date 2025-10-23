const Submissions = {
    slug: "submissions",
    fields: [
        { type: "relationship", hasMany: false, relationTo: "questions", name: "question" },
        { name: "answeredBy", type: "relationship", relationTo: "appUsers", hasMany: false },
        {
            name: "answer",
            type: "text",
            required: false,
            admin: {
                description: "The answer value submitted by the user",
            },
        },
    ],
};
export default Submissions;
