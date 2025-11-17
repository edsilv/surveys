# Overview Video

https://youtu.be/s3-qnSF83NY

# Survey Management System

A full-stack survey application built with Payload CMS, Next.js, and PostgreSQL.

**Features:**

- ✅ **React with Redux**: Survey form uses React with Redux Toolkit for state management
- ✅ **Dynamic Form Rendering**: Survey questions render from database configuration
- ✅ **Input Validation**: Client-side and server-side validation based on question configuration (required, minLength, maxLength, minChoices, maxChoices)
- ✅ **Validation Messages**: Error messages display to users with question titles
- ✅ **API Submission**: Form submits to REST API endpoint
- ✅ **Node.js REST API**: Custom Payload endpoints serving survey config and accepting responses
- ✅ **Database Storage**: PostgreSQL database stores responses as queryable records
- ✅ **Server Validation**: Comprehensive server-side validation with type checking
- ✅ **TypeScript**: Full TypeScript implementation throughout

**Stretch Goals Implemented:**

- ✅ **Cloud Deployment**: Deployed on Vercel with Neon PostgreSQL
- ✅ **Admin Functionality**: Full Payload CMS admin panel for survey management
- ✅ **Authentication**: Member login system to access assigned surveys
- ✅ **Conditional Rendering**: Questions show/hide based on previous answers with configurable conditions

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Redux Toolkit, Tailwind CSS, shadcn/ui
- **Backend**: Payload CMS 3, Node.js
- **Database**: PostgreSQL (Vercel/Neon)
- **Deployment**: Vercel

## Architecture Highlights

### Data Model

- **Collections**: Users, Respondents, Questions, Surveys, SurveyResponses, ResponseItems
- **Relationships**: Surveys link to Questions, Respondents receive survey invitations, responses are stored as queryable items
- **Schema Evolution**: Migration support for production environments with push mode for local development

### Custom Endpoints

- `GET /api/surveys/:id` - Fetch survey with member authorisation check
- `POST /api/survey-complete/:id` - Submit survey with comprehensive validation

### Validation System

- Question visibility based on conditional logic
- Required field checking
- Type-specific validation (string length, numeric ranges, array constraints)
- Error messages using question titles

## Project Structure

```
src/
├── app/                         # Next.js app router
│   ├── (frontend)/              # Public-facing pages
│   │   ├── (authenticated)/     # Protected member routes
│   │   │   └── dashboard/       # Survey dashboard & completion
│   │   └── (public)/            # Home page & login/signup
│   └── (payload)/               # Payload CMS admin
├── collections/                 # Payload collections
│   ├── Questions.ts             # Question definitions with validation
│   ├── Surveys.ts               # Survey configuration
│   ├── SurveyResponses.ts       # Response metadata
│   ├── ResponseItems.ts         # Individual queryable answers
│   └── Respondents.ts           # Respondent authentication
├── endpoints/                   # Custom API endpoints
│   └── surveyEndpoints.ts       # Survey retrieval & submission logic
├── store/                       # Redux state management
│   ├── surveySlice.ts           # Survey state & async thunks
│   └── hooks.ts                 # Typed Redux hooks
└── components/                  # Reusable UI components
```

## AI/ML Enhancement Opportunities

### Sentiment Analysis ✅

Analyse open-text responses to automatically gauge emotional tone (positive, negative, neutral). This would enable administrators to:

- Quickly identify concerning or highly positive feedback requiring immediate attention
- Track sentiment trends across different survey periods or demographic groups
- Prioritise responses for manual review based on sentiment scores

### Theme Extraction

Use Natural Language Processing to identify common themes and topics across multiple text responses. Benefits include:

- Automatic categorisation of feedback without manual coding
- Discovery of unexpected patterns or concerns not explicitly asked about
- Generation of word clouds and topic summaries for executive reporting

### Conversational Analytics

Provide a chatbot interface allowing administrators to query survey data using natural language:

- "What were the most common complaints in the last employee survey?"
- "Show me all responses from users who rated us below 3 stars"
- "Summarise the feedback from the London office"

## Potential Improvements

### Email Invitations with Magic Links

Add the ability to send invitation emails directly from Payload to all respondents assigned to a survey. Each email would contain a "magic link" that:

- Bypasses the need for respondents to manually log in
- Provides secure one-time or time-limited access to their assigned survey
- Improves response rates by reducing friction in the survey completion process
- Maintains security through token-based authentication

Implementation would require:

- Email service integration (resend.com)
- Token generation and validation system
- Custom Payload hooks to trigger emails when surveys are published
- Email templates with personalised survey links
- Token expiration and usage tracking

### Survey Templates and Cloning

Enable administrators to:

- Create reusable survey templates for common use cases
- Clone existing surveys with all questions and configurations
- Build a template library for different survey types (employee feedback, customer satisfaction, event feedback)

### Multi-language Support

Add internationalisation capabilities:

- Questions and answers in multiple languages
- Language selection at survey start
- Admin interface for managing translations
- Automatic language detection based on respondent preferences

### Response Rate Optimisation

Implement features to improve survey completion:

- Progress indicators showing completion percentage
- Save and resume functionality for long surveys
- Automated reminder emails for incomplete surveys
