import type { SVGProps } from 'react';

export function Shuttlecock(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14 22a4 4 0 0 0 4-4" />
      <path d="M18 18h2" />
      <path d="M18 18a4 4 0 0 1-4-4" />
      <path d="M14 14h4" />
      <path d="M14 14a4 4 0 0 1-4-4" />
      <path d="M10 10h6" />
      <path d="M10 10a4 4 0 0 1-4-4" />
      <path d="m6 6 4-4 4 4" />
      <path d="M10 2v4" />
      <path d="M18 18a4 4 0 0 0 4-4" />
      <path d="M22 14h-2" />
    </svg>
  );
}
