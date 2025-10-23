import type { Section, Question, Group } from "./types";

/**
 * Checks if a section is complete (all required questions have answers)
 */
export function isSectionComplete(section: Section, formData: Record<string, any>): boolean {
  // Get all groups in the section
  const groups = (section.groups || []).filter((g): g is Group => typeof g !== "string");

  // Get all questions from all groups
  const allQuestions: Question[] = [];
  for (const group of groups) {
    const questions = (group.questions || []).filter((q): q is Question => typeof q !== "string");
    allQuestions.push(...questions);
  }

  // Check if all required questions have non-empty answers
  for (const question of allQuestions) {
    if (question.required) {
      const answer = formData[question.id];

      // Check if answer is missing or empty
      if (answer === undefined || answer === null || answer === "" || answer === false) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Gets all incomplete required questions in a section
 */
export function getIncompleteQuestions(section: Section, formData: Record<string, any>): Question[] {
  const groups = (section.groups || []).filter((g): g is Group => typeof g !== "string");
  const incompleteQuestions: Question[] = [];

  for (const group of groups) {
    const questions = (group.questions || []).filter((q): q is Question => typeof q !== "string");

    for (const question of questions) {
      if (question.required) {
        const answer = formData[question.id];
        if (answer === undefined || answer === null || answer === "" || answer === false) {
          incompleteQuestions.push(question);
        }
      }
    }
  }

  return incompleteQuestions;
}

/**
 * Calculates section completion percentage
 */
export function getSectionProgress(section: Section, formData: Record<string, any>): number {
  const groups = (section.groups || []).filter((g): g is Group => typeof g !== "string");

  let totalQuestions = 0;
  let answeredQuestions = 0;

  for (const group of groups) {
    const questions = (group.questions || []).filter((q): q is Question => typeof q !== "string");

    for (const question of questions) {
      totalQuestions++;
      const answer = formData[question.id];

      if (answer !== undefined && answer !== null && answer !== "" && (typeof answer !== "boolean" || answer === true)) {
        answeredQuestions++;
      }
    }
  }

  return totalQuestions === 0 ? 100 : Math.round((answeredQuestions / totalQuestions) * 100);
}

