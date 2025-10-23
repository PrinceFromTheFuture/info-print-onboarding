const Templates = {
    slug: 'templates',
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
        },
        {
            name: 'description',
            type: 'textarea',
        },
        {
            name: 'sections',
            type: 'relationship',
            relationTo: 'sections',
            hasMany: true, // A template has many sections
        },
    ],
};
export default Templates;
