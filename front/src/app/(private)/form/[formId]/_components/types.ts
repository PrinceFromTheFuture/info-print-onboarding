// Types inferred from the backend Payload collections
// These match the structure returned by getFilledTemplateById

export interface Question {
  id: string;
  title: string;
  label?: string | null;
  required?: boolean | null;
  type?: "text" | "number" | "select" | "date" | "image" | "checkbox" | null;
  order: number;
  selectOptions?: Array<{ value?: string | null; id?: string }> | null;
  answer?: string | null; // Added by getFilledTemplateById
  createdAt?: string;
  updatedAt?: string;
}

export interface Group {
  id: string;
  title?: string | null;
  order?: number | null;
  showIf?: {
    question?: Question | string | null;
    equalTo?: string | null;
  } | null;
  questions?: Array<Question | string> | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Section {
  id: string;
  title: string;
  description: string;
  order?: number | null;
  groups?: Array<Group | string> | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string | null;
  sections?: Array<Section | string> | null;
  createdAt?: string;
  updatedAt?: string;
}

// Helper type guards
export const isSection = (section: Section | string): section is Section => {
  return typeof section !== "string";
};

export const isGroup = (group: Group | string): group is Group => {
  return typeof group !== "string";
};

export const isQuestion = (question: Question | string): question is Question => {
  return typeof question !== "string";
};

