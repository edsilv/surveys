'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSurvey, submitSurvey, updateResponse, clearSubmitStatus } from '@/store/surveySlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import type { Question } from '@/payload-types';

interface SurveyFormProps {
  surveyId: string;
}

export default function SurveyForm({ surveyId }: SurveyFormProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { survey, responses, loading, submitting, error, submitSuccess, submitError, validationErrors } =
    useAppSelector((state) => state.survey);

  useEffect(() => {
    dispatch(fetchSurvey(surveyId));
  }, [dispatch, surveyId]);

  useEffect(() => {
    if (submitSuccess) {
      setTimeout(() => {
        dispatch(clearSubmitStatus());
        router.push('/dashboard');
      }, 2000);
    }
  }, [submitSuccess, dispatch, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(submitSurvey({ surveyId, responses }));
  };

  const handleResponseChange = (questionSlug: string, value: unknown) => {
    dispatch(updateResponse({ questionSlug, value }));
  };

  const renderQuestion = (questionData: { question: Question | number }) => {
    const question = typeof questionData.question === 'object' ? questionData.question : null;
    if (!question || !question.slug) return null;

    // Check if question should be displayed based on conditions
    if (question.condition?.question && question.condition?.value) {
      const conditionQuestion = typeof question.condition.question === 'object' ? question.condition.question : null;

      if (conditionQuestion?.slug) {
        const actualValue = responses[conditionQuestion.slug];
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

        // Only show this question if the condition is met
        if (actualValue !== convertedExpectedValue) {
          return null;
        }
      }
    }

    const value = responses[question.slug];

    switch (question.type) {
      case 'text':
        return (
          <div key={question.id} className="space-y-2">
            <Label htmlFor={question.slug as string} className="font-semibold">
              {question.title}
              {question.validation?.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={question.slug as string}
              value={(value as string) || ''}
              onChange={(e) => handleResponseChange(question.slug as string, e.target.value)}
              required={question.validation?.required || false}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={question.id} className="space-y-2">
            <Label htmlFor={question.slug as string} className="font-semibold">
              {question.title}
              {question.validation?.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Textarea
              id={question.slug as string}
              value={(value as string) || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleResponseChange(question.slug as string, e.target.value)
              }
              required={question.validation?.required || false}
              rows={4}
            />
          </div>
        );

      case 'multiple_choice':
        return (
          <div key={question.id} className="space-y-3">
            <Label className="font-semibold">
              {question.title}
              {question.validation?.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <RadioGroup
              value={(value as string) || ''}
              onValueChange={(val: string) => handleResponseChange(question.slug as string, val)}
            >
              {question.options?.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${question.slug as string}-${idx}`} />
                  <Label htmlFor={`${question.slug as string}-${idx}`} className="cursor-pointer font-normal">
                    {option.value}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'multiple_select':
        return (
          <div key={question.id} className="space-y-3">
            <Label className="font-semibold">
              {question.title}
              {question.validation?.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {question.options?.map((option, idx) => {
                const currentValues = (value as string[]) || [];
                const isChecked = currentValues.includes(option.value);

                return (
                  <div key={idx} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${question.slug as string}-${idx}`}
                      checked={isChecked}
                      onCheckedChange={(checked: boolean) => {
                        const newValues = checked
                          ? [...currentValues, option.value]
                          : currentValues.filter((v) => v !== option.value);
                        handleResponseChange(question.slug as string, newValues);
                      }}
                    />
                    <Label htmlFor={`${question.slug as string}-${idx}`} className="cursor-pointer font-normal">
                      {option.value}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'multiple_select_with_other':
        return (
          <div key={question.id} className="space-y-3">
            <Label className="font-semibold">
              {question.title}
              {question.validation?.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {question.options?.map((option, idx) => {
                const currentValues = (value as string[]) || [];
                const isChecked = currentValues.includes(option.value);

                return (
                  <div key={idx} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${question.slug as string}-${idx}`}
                      checked={isChecked}
                      onCheckedChange={(checked: boolean) => {
                        const newValues = checked
                          ? [...currentValues, option.value]
                          : currentValues.filter((v) => v !== option.value);
                        handleResponseChange(question.slug as string, newValues);
                      }}
                    />
                    <Label htmlFor={`${question.slug as string}-${idx}`} className="cursor-pointer font-normal">
                      {option.value}
                    </Label>
                  </div>
                );
              })}
              <div className="space-y-2 pt-2">
                <Label htmlFor={`${question.slug as string}-other-input`} className="font-normal">
                  Other (please specify)
                </Label>
                <Input
                  id={`${question.slug as string}-other-input`}
                  placeholder="Type your answer here..."
                  value={(() => {
                    const currentValues = (value as string[]) || [];
                    const predefinedValues = question.options?.map((o) => o.value) || [];
                    const otherValue = currentValues.find((v) => !predefinedValues.includes(v));
                    return otherValue || '';
                  })()}
                  onChange={(e) => {
                    const currentValues = (value as string[]) || [];
                    const predefinedValues = question.options?.map((o) => o.value) || [];
                    const predefinedSelected = currentValues.filter((v) => predefinedValues.includes(v));

                    if (e.target.value) {
                      // Replace any existing "other" value with the new one
                      handleResponseChange(question.slug as string, [...predefinedSelected, e.target.value]);
                    } else {
                      // If cleared, remove all "other" values
                      handleResponseChange(question.slug as string, predefinedSelected);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        );

      case 'rating':
        return (
          <div key={question.id} className="space-y-3">
            <Label className="font-semibold">
              {question.title}
              {question.validation?.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <RadioGroup
              value={value ? String(value) : ''}
              onValueChange={(val: string) => handleResponseChange(question.slug as string, parseInt(val, 10))}
            >
              <div className="flex gap-4">
                {Array.from({ length: question.scale || 5 }, (_, i) => i + 1).map((num) => (
                  <div key={num} className="flex items-center space-x-2">
                    <RadioGroupItem value={String(num)} id={`${question.slug as string}-${num}`} />
                    <Label htmlFor={`${question.slug as string}-${num}`} className="cursor-pointer font-normal">
                      {num}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        );

      case 'yes_no':
        return (
          <div key={question.id} className="space-y-3">
            <Label className="font-semibold">
              {question.title}
              {question.validation?.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <RadioGroup
              value={value === undefined ? '' : value ? 'yes' : 'no'}
              onValueChange={(val: string) => handleResponseChange(question.slug as string, val === 'yes')}
            >
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id={`${question.slug as string}-yes`} />
                  <Label htmlFor={`${question.slug as string}-yes`} className="cursor-pointer font-normal">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id={`${question.slug as string}-no`} />
                  <Label htmlFor={`${question.slug as string}-no`} className="cursor-pointer font-normal">
                    No
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-destructive bg-destructive/10 text-destructive rounded-lg border p-4">
        <p className="font-medium">Error loading survey</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="border-muted bg-muted/50 rounded-lg border p-4">
        <p className="text-muted-foreground">Survey not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-12">
        <h1 className="text-2xl font-semibold">{survey.title}</h1>
        {survey.description && <p className="text-muted-foreground mt-2">{survey.description}</p>}
      </div>

      {submitSuccess && (
        <div className="mb-12 rounded-lg border border-green-500 bg-green-50 p-4 text-green-900">
          <p className="font-medium">Survey submitted successfully!</p>
          <p className="text-sm">Redirecting to dashboard...</p>
        </div>
      )}

      {submitError && (
        <div className="border-destructive bg-destructive/10 text-destructive mb-12 rounded-lg border p-4">
          <p className="font-medium">{typeof submitError === 'string' ? submitError : 'An error occurred'}</p>
          {validationErrors && validationErrors.length > 0 && (
            <ul className="mt-2 list-inside list-disc space-y-1">
              {validationErrors.map((err, idx) => (
                <li key={idx} className="text-sm">
                  {err.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="space-y-12">{(survey.questions || []).map((q) => renderQuestion(q))}</div>

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={submitting} className="min-w-[120px]">
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Survey'
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/dashboard')} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
