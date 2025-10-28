import { getPayload } from "src/db/getPayload.js";

const payload = await getPayload

const temp = await payload.findByID({
    collection: "templates",
    id: "6901020bbe9efd1ebc69fc28",
    depth: 90,
})

console.log(JSON.stringify(temp, null, 2))