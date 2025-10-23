const Assignments = {
    slug: "assignments",
    fields: [
        { type: "relationship", hasMany: false, relationTo: "templates", name: "template" },
        { type: "relationship", hasMany: false, relationTo: "appUsers", name: "appUser" },
        {
            name: "status",
            type: "select",
            options: [
                { label: "inProgress", value: "inProgress" },
                { label: "submitted", value: "submitted" },
                { label: "pending", value: "pending" },
            ],
        },
    ],
};
export default Assignments;
