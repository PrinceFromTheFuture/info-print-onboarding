import payloadConfig from "./payload.config.js";
import { getPayload as getPayloadInstance } from "payload";

export const getPayload = getPayloadInstance({ config: payloadConfig });
