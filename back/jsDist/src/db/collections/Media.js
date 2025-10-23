export const Media = {
    slug: "media",
    upload: {
        staticDir: "media",
        adminThumbnail: "thumbnail",
    },
    fields: [
        { name: "uploadedBy", type: "relationship", relationTo: "appUsers" },
        {
            name: "alt",
            type: "text",
        },
        { type: "text", name: "extention" },
    ],
};
