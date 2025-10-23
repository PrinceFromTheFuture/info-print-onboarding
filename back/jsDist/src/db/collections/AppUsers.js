const AppUsers = {
    slug: "appUsers",
    fields: [
        {
            name: "name",
            type: "text",
            required: true,
        },
        {
            name: "email",
            type: "text",
            required: true,
        },
        {
            name: "role",
            type: "select",
            options: [
                {
                    label: "Admin",
                    value: "admin",
                },
                {
                    label: "Customer",
                    value: "customer",
                },
            ],
        },
        {
            name: "assignedTemplates",
            type: "relationship",
            relationTo: "templates",
            hasMany: true,
        },
    ],
};
export default AppUsers;
