const Fields = {
    slug: "fields",
    fields: [
        {
            name: "selectOptions",
            type: "array",
            fields: [
                {
                    name: "value",
                    type: "text",
                },
            ],
        },
        {
            name: "type",
            type: "select",
            options: [
                { label: "Text", value: "text" },
                { label: "Number", value: "number" },
                { label: "Select", value: "select" },
                { label: "date", value: "date" },
                { label: "image", value: "image" },
                { label: "checkbox", value: "checkbox" },
            ],
        },
    ],
};
export default Fields;
