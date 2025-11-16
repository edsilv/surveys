import type { Payload, PayloadRequest } from 'payload';
import type { Question } from '../payload-types';

interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate a single response against question validation rules
 */
function validateResponse(
  question: Question,
  value: unknown,
  allResponses: Record<string, unknown>,
): ValidationError | null {
  const { slug, type, validation, title } = question;

  if (!slug) return null;

  const displayName = title || slug;

  // Check if question should be displayed based on conditions
  if (question.condition?.question && question.condition?.value) {
    const conditionQuestion = typeof question.condition.question === 'object' ? question.condition.question : null;

    if (conditionQuestion?.slug) {
      const actualValue = allResponses[conditionQuestion.slug];
      const expectedValue = question.condition.value;

      // Convert the expected value based on the condition question type
      let convertedExpectedValue: unknown = expectedValue;
      if (conditionQuestion.type === 'yes_no') {
        // Convert "true"/"false" strings to booleans
        convertedExpectedValue = expectedValue === 'true';
      } else if (conditionQuestion.type === 'rating') {
        // Convert to number
        convertedExpectedValue = Number(expectedValue);
      }

      if (actualValue !== convertedExpectedValue) {
        // Question is hidden, so it's optional
        return null;
      }
    }
  }

  // Required validation
  if (validation?.required) {
    if (value === undefined || value === null || value === '') {
      return { field: slug, message: `${displayName} is required` };
    }

    if (Array.isArray(value) && value.length === 0) {
      return { field: slug, message: `${displayName} requires at least one selection` };
    }
  }

  // Skip further validation if value is empty and not required
  if (!value && !validation?.required) {
    return null;
  }

  // Type-specific validation
  switch (type) {
    case 'text':
    case 'textarea': {
      if (typeof value !== 'string') {
        return { field: slug, message: `${displayName} must be a string` };
      }

      if (validation?.minLength && value.length < validation.minLength) {
        return {
          field: slug,
          message: `${displayName} must be at least ${validation.minLength} characters`,
        };
      }

      if (validation?.maxLength && value.length > validation.maxLength) {
        return {
          field: slug,
          message: `${displayName} must be no more than ${validation.maxLength} characters`,
        };
      }
      break;
    }

    case 'multiple_choice': {
      if (typeof value !== 'string') {
        return { field: slug, message: `${displayName} must be a string` };
      }

      const validOptions = question.options?.map((opt) => opt.value) || [];
      if (!validOptions.includes(value)) {
        return { field: slug, message: `${displayName} must be one of: ${validOptions.join(', ')}` };
      }
      break;
    }

    case 'multiple_select':
    case 'multiple_select_with_other': {
      if (!Array.isArray(value)) {
        return { field: slug, message: `${displayName} must be an array` };
      }

      if (validation?.minChoices && value.length < validation.minChoices) {
        return {
          field: slug,
          message: `${displayName} requires at least ${validation.minChoices} selection(s)`,
        };
      }

      if (validation?.maxChoices && value.length > validation.maxChoices) {
        return {
          field: slug,
          message: `${displayName} allows no more than ${validation.maxChoices} selection(s)`,
        };
      }

      const validOptions = question.options?.map((opt) => opt.value) || [];
      const allowOther = type === 'multiple_select_with_other';

      for (const item of value) {
        if (typeof item !== 'string') {
          return { field: slug, message: `${displayName} values must be strings` };
        }

        // For multiple_select (without other), all values must be from predefined options
        // For multiple_select_with_other, allow any string value (predefined or custom "other" text)
        if (!allowOther && !validOptions.includes(item)) {
          return { field: slug, message: `${displayName} contains invalid option: ${item}` };
        }
      }
      break;
    }

    case 'rating': {
      if (typeof value !== 'number') {
        return { field: slug, message: `${displayName} must be a number` };
      }

      if (value < 1 || value > (question.scale || 5)) {
        return {
          field: slug,
          message: `${displayName} must be between 1 and ${question.scale || 5}`,
        };
      }
      break;
    }

    case 'yes_no': {
      if (typeof value !== 'boolean') {
        return { field: slug, message: `${displayName} must be a boolean` };
      }
      break;
    }
  }

  return null;
}

/**
 * Validate all responses against survey questions
 */
export function validateSurveyResponses(questions: Question[], responses: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const question of questions) {
    if (!question.slug) continue;
    const value = responses[question.slug];
    const error = validateResponse(question, value, responses);
    if (error) {
      errors.push(error);
    }
  }

  return errors;
}

/**
 * GET /api/surveys/:id - Retrieve a survey with its questions
 */
export async function getSurvey(payload: Payload, surveyId: string, request?: PayloadRequest) {
  try {
    // Get authenticated user from request
    const user = request?.user;

    const survey = await payload.findByID({
      collection: 'surveys',
      id: surveyId,
      depth: 2, // Include related questions
    });

    if (!survey) {
      return {
        status: 404,
        body: { error: 'Survey not found' },
      };
    }

    if (!survey.active) {
      return {
        status: 403,
        body: { error: 'This survey is not currently accepting responses' },
      };
    }

    // Check if survey is restricted to specific members
    if (survey.members && Array.isArray(survey.members) && survey.members.length > 0) {
      // Require authentication for member-restricted surveys
      if (!user) {
        return {
          status: 401,
          body: { error: 'Authentication required to access this survey' },
        };
      }

      const memberId = typeof user === 'object' && user !== null ? Number(user.id) : Number(user);
      const memberIds = survey.members.map((m) => (typeof m === 'object' ? Number(m.id) : Number(m)));

      if (!memberIds.includes(memberId)) {
        return {
          status: 403,
          body: { error: 'You are not authorized to access this survey' },
        };
      }
    }

    return {
      status: 200,
      body: survey,
    };
  } catch (error) {
    return {
      status: 500,
      body: { error: 'Failed to retrieve survey', details: String(error) },
    };
  }
}

/**
 * POST /api/sentiment-analysis - Analyze sentiment of text responses
 */
export async function analyzeSentiment(payload: Payload, request: PayloadRequest) {
  try {
    const body = request.json ? await request.json() : {};
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return {
        status: 400,
        body: { error: 'Invalid request: text must be a string' },
      };
    }

    // Import OpenAI dynamically
    const { default: OpenAI } = await import('openai');

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are a sentiment analysis assistant. Analyze the sentiment and respond with only one word: "Positive", "Negative", or "Neutral".',
        },
        {
          role: 'user',
          content: `Analyze the sentiment of the following text: "${text}"`,
        },
      ],
      max_tokens: 10,
    });

    const sentiment = response.choices[0]?.message?.content?.trim() || 'Neutral';

    return {
      status: 200,
      body: { sentiment },
    };
  } catch (error) {
    return {
      status: 500,
      body: { error: 'Failed to analyze sentiment', details: String(error) },
    };
  }
}

/**
 * POST /api/surveys/:id/complete - Submit and mark a survey as complete
 */
export async function completeSurvey(payload: Payload, surveyId: string, request: PayloadRequest) {
  try {
    // Check if user is authenticated as a member
    const user = request.user;

    if (!user) {
      return {
        status: 401,
        body: { error: 'Authentication required. Please log in to complete surveys.' },
      };
    }

    const memberId = typeof user === 'object' && user !== null ? Number(user.id) : Number(user);

    // Get the survey with questions and member associations
    const survey = await payload.findByID({
      collection: 'surveys',
      id: surveyId,
      depth: 2,
    });

    if (!survey) {
      return {
        status: 404,
        body: { error: 'Survey not found' },
      };
    }

    if (!survey.active) {
      return {
        status: 403,
        body: { error: 'This survey is not currently accepting responses' },
      };
    }

    // Check if member is authorized to complete this survey (if members are specified)
    if (survey.members && Array.isArray(survey.members) && survey.members.length > 0) {
      const memberIds = survey.members.map((m) => (typeof m === 'object' ? Number(m.id) : Number(m)));
      if (!memberIds.includes(memberId)) {
        return {
          status: 403,
          body: { error: 'You are not authorized to complete this survey' },
        };
      }
    }

    // Check if member has already completed this survey
    const existingResponse = await payload.find({
      collection: 'survey-responses',
      where: {
        and: [
          { survey: { equals: parseInt(surveyId, 10) } },
          { member: { equals: memberId } },
          { completed: { equals: true } },
        ],
      },
    });

    if (existingResponse.docs.length > 0) {
      return {
        status: 409,
        body: { error: 'You have already completed this survey' },
      };
    }

    // Parse request body
    const body = request.json ? await request.json() : {};
    const { responses } = body;

    if (!responses || typeof responses !== 'object') {
      return {
        status: 400,
        body: { error: 'Invalid request: responses must be an object' },
      };
    }

    // Extract questions from survey
    const questions: Question[] = [];
    if (Array.isArray(survey.questions)) {
      for (const item of survey.questions) {
        if (typeof item.question === 'object' && item.question !== null) {
          questions.push(item.question as Question);
        }
      }
    }

    // Validate responses
    const validationErrors = validateSurveyResponses(questions, responses);
    if (validationErrors.length > 0) {
      return {
        status: 400,
        body: {
          error: 'Validation failed',
          errors: validationErrors,
        },
      };
    }

    // Create survey response
    const surveyResponse = await payload.create({
      collection: 'survey-responses',
      data: {
        survey: parseInt(surveyId, 10),
        member: memberId,
        completed: true,
        completedAt: new Date().toISOString(),
      },
    });

    // Create individual response items for each answer
    const responseItemPromises = questions.map(async (question) => {
      if (!question.slug) return null;

      const value = responses[question.slug];

      // Skip if no value provided and not required
      if (value === undefined || value === null || value === '') {
        return null;
      }

      // Prepare the response item data based on question type
      const itemData: {
        surveyResponse: number;
        question: number;
        questionSlug: string;
        questionType:
          | 'text'
          | 'textarea'
          | 'multiple_choice'
          | 'multiple_select'
          | 'multiple_select_with_other'
          | 'rating'
          | 'yes_no';
        textValue?: string | null;
        numberValue?: number | null;
        booleanValue?: boolean | null;
        arrayValue?: Array<{ value: string }> | null;
      } = {
        surveyResponse: surveyResponse.id as number,
        question: question.id as number,
        questionSlug: question.slug as string,
        questionType: question.type as
          | 'text'
          | 'textarea'
          | 'multiple_choice'
          | 'multiple_select'
          | 'multiple_select_with_other'
          | 'rating'
          | 'yes_no',
      };

      // Store value in appropriate field based on type
      switch (question.type) {
        case 'text':
        case 'textarea':
        case 'multiple_choice':
          itemData.textValue = String(value);
          break;
        case 'rating':
          itemData.numberValue = Number(value);
          break;
        case 'yes_no':
          itemData.booleanValue = Boolean(value);
          break;
        case 'multiple_select':
        case 'multiple_select_with_other':
          if (Array.isArray(value)) {
            itemData.arrayValue = value.map((v) => ({ value: String(v) }));
          }
          break;
      }

      return payload.create({
        collection: 'response-items',
        data: itemData,
      });
    });

    // Wait for all response items to be created
    await Promise.all(responseItemPromises);

    return {
      status: 201,
      body: {
        message: 'Survey completed successfully',
        id: surveyResponse.id,
      },
    };
  } catch (error) {
    return {
      status: 500,
      body: { error: 'Failed to complete survey', details: String(error) },
    };
  }
}
