const Visits = {
    slug: "visits",
    fields: [
        { type: "relationship", hasMany: false, relationTo: "appUsers", name: "appUser" },
        { type: "select", name: "type", options: ["mobile", "desktop"] },
    ],
};
export default Visits;
