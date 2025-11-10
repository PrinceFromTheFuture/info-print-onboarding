import axios from "axios";

export function Notifier(message: string) {
  const url = process.env.NOTIFIER_WEB_HOOK;
  if (!url) {
    throw new Error("NOTIFIER_WEB_HOOK is not set");
  }
  const res = axios.post(url, {
    text: message,
  });

  return res;
}
