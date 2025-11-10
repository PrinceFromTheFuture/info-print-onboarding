import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { trpcClient } from "../../trpc-client";
import type { inferProcedureOutput } from "@trpc/server";
import { ROUTES } from "@/lib/routes";
import { AppRouter } from "../../../../../back/dist/src/trpc";

// The return type from getFilledTemplateById (with answer fields added to questions)
type FilledForm = inferProcedureOutput<AppRouter["templatesRouter"]["getFilledTemplateById"]>;

// Form data value types: answers from backend are strings, but checkbox stores boolean temporarily
// All backend answers are string | null, checkbox converts boolean to/from string
export type FormDataValue = string | boolean | null | undefined;
export type FormStateData = Record<string, FormDataValue>;

// Async thunk to fetch the filled template with user's answers
export const getFilledTemplateByIdAsyncThunk = createAsyncThunk<any, { formId: string; userId?: string }>(
  "form/getFilledTemplateById",
  async ({ formId, userId }: { formId: string; userId?: string }) => {
    // Use the trpcClient singleton - works outside React components!
    const filledTemplate = await trpcClient.templatesRouter.getFilledTemplateById.query({ id: formId, userId });
    return filledTemplate;
  }
);

// Debounce timers for each question
const debounceTimers: Record<string, NodeJS.Timeout> = {};

// Async thunk to update or create a submission (used after debouncing)
export const updateOrCreateSubmissionAsyncThunk = createAsyncThunk<any, { questionId: string; value: string }, { rejectValue: string }>(
  "form/updateOrCreateSubmission",
  async ({ questionId, value }, { rejectWithValue }) => {
    try {
      const response = await trpcClient.submittionsRouter.updateOrCreateSubmission.mutate({
        questionId,
        value,
      });
      return { questionId, value, response };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to save submission");
    }
  }
);

// Async thunk to upload an image
export const uploadImageAsyncThunk = createAsyncThunk<
  { fileUrl: string; mediaId: string; questionId: string },
  { questionId: string; file: File; userId: string },
  { rejectValue: string }
>("form/uploadImage", async ({ questionId, file, userId }, { rejectWithValue }) => {
  try {
    // Create FormData and append the file
    const formData = new FormData();
    formData.append("file", file);
    formData.append("alt", `Upload for question ${questionId}`);
    formData.append("userId", userId);

    const response = await fetch(ROUTES.api.baseUrl + ROUTES.api.media.upload, {
      method: "POST",
      credentials: "include",
      body: formData,
      // Don't set Content-Type header - browser will set it automatically with boundary
    });

    if (!response.ok) {
      throw new Error("Failed to upload image, try again later.");
    }

    const data = await response.json();
    const fileUrl = `${ROUTES.api.baseUrl}${data.serverFileUrl}`;
    return { fileUrl, mediaId: data.mediaId, questionId };
  } catch (error) {
    return rejectWithValue("Failed to upload image, try again later.");
  }
});

interface FormState {
  form: null | FilledForm;
  isLoading: boolean;
  error: string | null;
  currentSectionIndex: number;
  formData: FormStateData;
  completedSections: string[];
  sidebarOpen: boolean;
  // Track loading state per question
  questionLoadingStates: Record<string, boolean>;
  // Track errors per question
  questionErrors: Record<string, string | null>;
}

const initialState: FormState = {
  form: null,
  isLoading: false,
  error: null,
  currentSectionIndex: 0,
  formData: {},
  completedSections: [],
  sidebarOpen: false,
  questionLoadingStates: {},
  questionErrors: {},
};

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    clearForm: (state) => {
      state.form = null;
      state.error = null;
      state.formData = {};
      state.currentSectionIndex = 0;
      state.completedSections = [];
    },
    setCurrentSectionIndex: (state, action: PayloadAction<number>) => {
      state.currentSectionIndex = action.payload;
    },
    nextSection: (state) => {
      state.currentSectionIndex += 1;
    },
    previousSection: (state) => {
      if (state.currentSectionIndex > 0) {
        state.currentSectionIndex -= 1;
      }
    },
    setFieldValue: (state, action: PayloadAction<{ questionId: string; value: FormDataValue }>) => {
      state.formData[action.payload.questionId] = action.payload.value;
    },
    setQuestionLoading: (state, action: PayloadAction<{ questionId: string; isLoading: boolean }>) => {
      state.questionLoadingStates[action.payload.questionId] = action.payload.isLoading;
    },
    setQuestionError: (state, action: PayloadAction<{ questionId: string; error: string | null }>) => {
      state.questionErrors[action.payload.questionId] = action.payload.error;
    },
    markSectionComplete: (state, action: PayloadAction<string>) => {
      if (!state.completedSections.includes(action.payload)) {
        state.completedSections.push(action.payload);
      }
    },
    toggleSidebar: (state, action: PayloadAction<boolean | undefined>) => {
      state.sidebarOpen = action.payload !== undefined ? action.payload : !state.sidebarOpen;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFilledTemplateByIdAsyncThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFilledTemplateByIdAsyncThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.form = action.payload;

        // Automatically populate form data from answers in the template
        if (action.payload?.sections) {
          const newFormData: FormStateData = {};

          action.payload.sections.forEach((section: any) => {
            if (typeof section === "string") return;

            section.groups?.forEach((group: any) => {
              if (typeof group === "string") return;

              group.questions?.forEach((question: any) => {
                if (typeof question === "string") return;

                // If the question has an answer, populate it
                // Checkbox answers from backend are "true"/"false" strings, convert to boolean for checkbox type
                if (question.answer !== null && question.answer !== undefined) {
                  if (question.type === "checkbox" && (question.answer === "true" || question.answer === "false")) {
                    newFormData[question.id] = question.answer === "true";
                  } else {
                    newFormData[question.id] = question.answer;
                  }
                }
              });
            });
          });

          state.formData = newFormData;
        }
      })
      .addCase(getFilledTemplateByIdAsyncThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch template";
      })
      // Update or create submission
      .addCase(updateOrCreateSubmissionAsyncThunk.pending, (state, action) => {
        state.questionLoadingStates[action.meta.arg.questionId] = true;
        state.questionErrors[action.meta.arg.questionId] = null;
      })
      .addCase(updateOrCreateSubmissionAsyncThunk.fulfilled, (state, action) => {
        state.questionLoadingStates[action.payload.questionId] = false;
      })
      .addCase(updateOrCreateSubmissionAsyncThunk.rejected, (state, action) => {
        state.questionLoadingStates[action.meta.arg.questionId] = false;
        state.questionErrors[action.meta.arg.questionId] = action.payload || "Failed to save";
      })
      // Upload image
      .addCase(uploadImageAsyncThunk.pending, (state, action) => {
        state.questionLoadingStates[action.meta.arg.questionId] = true;
        state.questionErrors[action.meta.arg.questionId] = null;
      })
      .addCase(uploadImageAsyncThunk.fulfilled, (state, action) => {
        state.questionLoadingStates[action.payload.questionId] = false;
        // Store the file URL in formData (fileUrl is a string)
        state.formData[action.payload.questionId] = action.payload.fileUrl;
      })
      .addCase(uploadImageAsyncThunk.rejected, (state, action) => {
        state.questionLoadingStates[action.meta.arg.questionId] = false;
        state.questionErrors[action.meta.arg.questionId] = action.payload || "Failed to upload image";
      });
  },
});

export const {
  clearForm,
  setCurrentSectionIndex,
  nextSection,
  previousSection,
  setFieldValue,
  setQuestionLoading,
  setQuestionError,
  markSectionComplete,
  toggleSidebar,
} = formSlice.actions;

export const formReducer = formSlice.reducer;
export const formActions = formSlice.actions;

// Helper function to create a debounced field update action
// This returns a thunk that can be dispatched
// Note: For checkbox, convert boolean to string before saving
export const debouncedFieldUpdate = (questionId: string, value: string, debounceMs: number = 1000) => {
  return (dispatch: any) => {
    // Optimistically update the field value immediately (keep as string for formData)
    dispatch(setFieldValue({ questionId, value }));

    // Clear existing timer for this question
    if (debounceTimers[questionId]) {
      clearTimeout(debounceTimers[questionId]);
    }

    // Set new timer to save after debounce period
    debounceTimers[questionId] = setTimeout(() => {
      dispatch(updateOrCreateSubmissionAsyncThunk({ questionId, value }));
    }, debounceMs);
  };
};

export default formSlice;
