import StoreProvider from '@/store/StoreProvider';
import SurveyForm from './_components/SurveyForm';
import Section from '../../../../_components/Section';

type SurveyDetailsPageProps = {
  params: Promise<{
    lng: string;
    surveyid: string;
  }>;
};

const SurveyPage = async ({ params }: SurveyDetailsPageProps) => {
  const p = await params;
  const { surveyid } = p;

  return (
    <Section>
      <StoreProvider>
        <SurveyForm surveyId={surveyid} />
      </StoreProvider>
    </Section>
  );
};

export default SurveyPage;
