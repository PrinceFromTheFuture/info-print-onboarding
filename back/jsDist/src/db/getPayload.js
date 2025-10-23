import payloadConfig from "src/db/payload.config";
import { getPayload as getPayloadInstance } from "payload";
export const getPayload = getPayloadInstance({ config: payloadConfig });
