const Sections = {
    slug: "sections",
    fields: [
        {
            name: "title",
            type: "text",
            required: true,
        },
        {
            name: "description",
            type: "text",
            required: true,
        },
        {
            name: "order",
            type: "number",
        },
        {
            name: "groups",
            type: "relationship",
            relationTo: "groups",
            hasMany: true,
        },
    ],
};
export default Sections;
