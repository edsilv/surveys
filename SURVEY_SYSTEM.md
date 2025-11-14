# Survey System

This project includes a complete survey management system built with Payload CMS.

## Collections

### Questions

Manage individual survey questions with support for multiple question types:

- **text**: Single-line text input
- **textarea**: Multi-line text input
- **multiple_choice**: Single selection from options
- **multiple_select**: Multiple selections from options
- **multiple_select_with_other**: Multiple selections with "Other" option
- **rating**: Numeric rating scale (e.g., 1-5)
- **yes_no**: Boolean yes/no question

Each question includes:

- **label**: Display text for the question
- **name**: Unique identifier used in responses
- **options**: Available choices (for choice-based questions)
- **scale**: Maximum rating value (for rating questions)
- **validation**: Required, min/max length, min/max choices
- **condition**: Display question conditionally based on another question's answer

### Members

User accounts with authentication enabled. Members can be assigned to surveys and complete them.

- **email**: Member's email address (used for login)
- **password**: Encrypted password for authentication
- Authentication is handled by Payload's built-in auth system

### Surveys

Manage surveys composed of multiple questions:

- **title**: Survey title
- **description**: Optional survey description
- **questions**: Array of questions with display order
- **members**: Optional list of members who can access this survey (if empty, all authenticated members can access)
- **active**: Whether the survey is accepting responses

### Survey Responses

Track completed survey submissions:

- **survey**: Reference to the survey
- **member**: Reference to the member who completed it (required)
- **completed**: Whether the survey was completed
- **completedAt**: Timestamp of completion
- **submittedBy**: Email of the member (for quick reference)

### Response Items

Individual answers for each question (enables efficient querying):

- **surveyResponse**: Reference to the parent survey response
- **question**: Reference to the question
- **questionName**: Question name (indexed for fast queries)
- **questionType**: Question type (indexed)
- **textValue**: For text, textarea, and multiple_choice responses (indexed)
- **numberValue**: For rating responses (indexed)
- **booleanValue**: For yes_no responses (indexed)
- **arrayValue**: For multiple_select responses

This structure allows you to efficiently query responses, for example:

- "How many users answered yes to question X?"
- "What's the average rating for question Y?"
- "Which users selected option Z?"

## API Endpoints

### GET /api/surveys/:id

Retrieve a survey with all its questions.

**Authentication:** Required if the survey is restricted to specific members.

**Response:**

```json
{
  "id": 1,
  "title": "Customer Satisfaction Survey",
  "description": "...",
  "questions": [
    {
      "question": {
        "id": 1,
        "type": "text",
        "label": "What is your name?",
        "name": "name",
        "validation": {
          "required": true,
          "minLength": 3
        }
      },
      "order": 0
    }
  ],
  "active": true
}
```

### POST /api/surveys/:id/complete

Submit responses and mark a survey as complete. This endpoint creates both a SurveyResponse record and individual ResponseItem records for each answer, enabling efficient querying.

**Authentication:** Required - must be logged in as a member.

**Authorization:**

- If the survey has specific members assigned, only those members can complete it
- Members can only complete each survey once

**Request Body:**

```json
{
  "responses": {
    "name": "John Doe",
    "rating": 5,
    "recommend": true,
    "feedback": "Great service!"
  }
}
```

**Note:** The `submittedBy` field is automatically populated from the authenticated member's email.

**Response (Success):**

```json
{
  "message": "Survey completed successfully",
  "id": 123
}
```

**What happens internally:**

1. Verifies member authentication
2. Checks if member is authorized to access the survey
3. Ensures member hasn't already completed this survey
4. Validates all responses against question rules
5. Creates a SurveyResponse record linked to the member
6. Creates individual ResponseItem records for each answer with appropriate indexing

**Response (Validation Error):**

```json
{
  "error": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "name is required"
    },
    {
      "field": "rating",
      "message": "rating must be between 1 and 5"
    }
  ]
}
```

## Validation Rules

The system automatically validates responses based on question configuration:

- **Required fields**: Must have a value
- **Text/Textarea**: Min/max length validation
- **Multiple choice**: Must be a valid option
- **Multiple select**: Min/max choices, valid options
- **Rating**: Must be between 1 and the configured scale
- **Yes/No**: Must be a boolean
- **Conditional questions**: Only validated if their condition is met

## Example Usage

1. **Create Members** - Register members through the admin panel or auth endpoints
2. **Create Questions** in the admin panel
3. **Create a Survey** and add questions with display order
4. **Optional: Assign specific members** to the survey (leave empty for all members)
5. **Mark the survey as active**
6. **Members authenticate** using Payload's auth system
7. **Retrieve the survey** via `GET /api/surveys/:id` (with authentication)
8. **Submit responses** via `POST /api/surveys/:id/complete` (with authentication)

## Querying Responses

The ResponseItems collection is fully queryable. Here are some example queries:

### Count users who answered "yes" to a question

```typescript
const yesCount = await payload.count({
  collection: 'response-items',
  where: {
    questionName: { equals: 'recommend' },
    booleanValue: { equals: true },
  },
});
```

### Get average rating for a question

```typescript
const ratings = await payload.find({
  collection: 'response-items',
  where: {
    questionName: { equals: 'rating' },
  },
});
const avg = ratings.docs.reduce((sum, item) => sum + (item.numberValue || 0), 0) / ratings.docs.length;
```

### Find all responses containing specific text

```typescript
const responses = await payload.find({
  collection: 'response-items',
  where: {
    questionName: { equals: 'feedback' },
    textValue: { contains: 'excellent' },
  },
});
```

### Find users who selected "Social Media" as referral source

```typescript
const socialMediaUsers = await payload.find({
  collection: 'response-items',
  where: {
    questionName: { equals: 'referral' },
    textValue: { equals: 'Social Media' },
  },
  depth: 1, // Include surveyResponse with submittedBy
});
```

## Demo Survey

See `misc/survey.json` for a complete example survey structure with all question types.
