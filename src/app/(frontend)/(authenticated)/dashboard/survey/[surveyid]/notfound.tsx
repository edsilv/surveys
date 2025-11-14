import Link from 'next/link';

export default function NotFound() {
  return (
    <div>
      <h1>Survey Not Found</h1>
      <p>The survey you are looking for does not exist.</p>
      <Link href="/dashboard/">Go back to dashboard</Link>
    </div>
  );
}
