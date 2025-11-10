import axios from "axios";


export async function Notifier(message: string) {
    const url = process.env.NOTIFIER_WEB_HOOK;
    if (!url) {
      throw new Error("NOTIFIER_WEB_HOOK is not set");
    }
    const res = await axios.post(url, {
      text: message,
    });
    return res.data;
  }
  
  await Notifier("Hello from the test file!").then(res => console.log(res));