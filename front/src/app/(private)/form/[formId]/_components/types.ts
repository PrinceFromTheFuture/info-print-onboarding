import type {
  Question as QuestionType,
  Group as GroupType,
  Template as TemplateType,
  Section as SectionType,
} from "../../../../../../../back/payload-types";

export type Question = QuestionType & { answer?: string | null };

export type Group = GroupType;

export type Section = SectionType;

export type Template = TemplateType;

// Helper type guards
export const isSection = (section: Section): section is Section => {
  return typeof section !== "string";
};

export const isGroup = (group: Group | string): group is Group => {
  return typeof group !== "string";
};

export const isQuestion = (question: Question | string): question is Question => {
  return typeof question !== "string";
};
