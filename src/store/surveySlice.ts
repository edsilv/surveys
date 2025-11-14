import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Survey } from '@/payload-types';

interface ValidationError {
  field: string;
  message: string;
}

interface SurveyState {
  survey: Survey | null;
  responses: Record<string, unknown>;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  submitSuccess: boolean;
  submitError: string | null;
  validationErrors: ValidationError[];
}

const initialState: SurveyState = {
  survey: null,
  responses: {},
  loading: false,
  submitting: false,
  error: null,
  submitSuccess: false,
  submitError: null,
  validationErrors: [],
};

// Async thunk to fetch survey
export const fetchSurvey = createAsyncThunk('survey/fetchSurvey', async (surveyId: string, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/surveys/${surveyId}`);
    const data = await response.json();

    if (!response.ok) {
      return rejectWithValue(data.error || 'Failed to load survey');
    }

    return data as Survey;
  } catch (_error) {
    return rejectWithValue('Network error. Please try again.');
  }
});

// Async thunk to submit survey responses
export const submitSurvey = createAsyncThunk(
  'survey/submitSurvey',
  async ({ surveyId, responses }: { surveyId: string; responses: Record<string, unknown> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/survey-complete/${surveyId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ responses }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      return data;
    } catch (_error) {
      return rejectWithValue({ error: 'Network error. Please try again.', errors: [] });
    }
  },
);

const surveySlice = createSlice({
  name: 'survey',
  initialState,
  reducers: {
    updateResponse: (state, action: PayloadAction<{ questionSlug: string; value: unknown }>) => {
      state.responses[action.payload.questionSlug] = action.payload.value;
    },
    resetSurvey: (state) => {
      state.survey = null;
      state.responses = {};
      state.error = null;
      state.submitSuccess = false;
      state.submitError = null;
    },
    clearSubmitStatus: (state) => {
      state.submitSuccess = false;
      state.submitError = null;
      state.validationErrors = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch survey
    builder.addCase(fetchSurvey.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSurvey.fulfilled, (state, action) => {
      state.loading = false;
      state.survey = action.payload;
      state.responses = {};
    });
    builder.addCase(fetchSurvey.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Submit survey
    builder.addCase(submitSurvey.pending, (state) => {
      state.submitting = true;
      state.submitError = null;
      state.validationErrors = [];
    });
    builder.addCase(submitSurvey.fulfilled, (state) => {
      state.submitting = false;
      state.submitSuccess = true;
      state.validationErrors = [];
    });
    builder.addCase(submitSurvey.rejected, (state, action) => {
      state.submitting = false;
      const payload = action.payload as { error?: string; errors?: ValidationError[] } | undefined;
      if (payload && typeof payload === 'object' && 'error' in payload) {
        state.submitError = payload.error || 'Failed to submit survey';
        state.validationErrors = payload.errors || [];
      } else {
        state.submitError = 'Failed to submit survey';
        state.validationErrors = [];
      }
    });
  },
});

export const { updateResponse, resetSurvey, clearSubmitStatus } = surveySlice.actions;
export default surveySlice.reducer;
