import axios from "axios";

const ROOMS_WEB_HOOKS = {
  tickets:
    "https://chat.googleapis.com/v1/spaces/AAQA7u4SLDk/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=ef_0ouhUbax34J6PuFJ7QZb3nXIrJVZ1bQR-NSO7esc",
  newCustomes:
    "https://chat.googleapis.com/v1/spaces/AAQA-VKej0U/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=N1C7GMeETbcNZEvxTeUB1IuqlB-iuPu8gLKjJ8T05QE",
  forms:
    "https://chat.googleapis.com/v1/spaces/AAQAH0snWd8/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=0gOdhDWhhTDUVEQ9Rn0M9ueQ1V8RUmTYW5-XF7VB3ok",
} as const;

export function Notifier(message: string, room: keyof typeof ROOMS_WEB_HOOKS) {
  const url = ROOMS_WEB_HOOKS[room];
  const res = axios.post(url, {
    text: message,
  });

  return res;
}
