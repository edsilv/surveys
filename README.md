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
- **Storage**: Vercel Blob
- **Deployment**: Vercel

## Architecture Highlights

### Data Model

- **Collections**: Users, Members, Questions, Surveys, SurveyResponses, ResponseItems
- **Relationships**: Surveys link to Questions, Members receive survey invitations, responses are stored as queryable items
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
│   │   └── (auth)/              # Login/signup pages
│   └── (payload)/               # Payload CMS admin
├── collections/                 # Payload collections
│   ├── Questions.ts             # Question definitions with validation
│   ├── Surveys.ts               # Survey configuration
│   ├── SurveyResponses.ts       # Response metadata
│   ├── ResponseItems.ts         # Individual queryable answers
│   └── Members.ts               # Member authentication
├── endpoints/                   # Custom API endpoints
│   └── surveyEndpoints.ts       # Survey retrieval & submission logic
├── store/                       # Redux state management
│   ├── surveySlice.ts           # Survey state & async thunks
│   └── hooks.ts                 # Typed Redux hooks
└── components/                  # Reusable UI components
```
