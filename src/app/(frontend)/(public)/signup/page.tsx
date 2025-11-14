import { ReactElement } from 'react';
import SignupForm from './_components/SignupForm';

export default async function Page(): Promise<ReactElement> {
  return (
    <div>
      <SignupForm />
    </div>
  );
}
