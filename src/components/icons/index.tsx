import type { LucideProps } from 'lucide-react';

export const Icons = {
  Warehouse: (props: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3 6.5l8-4.21a2 2 0 0 1 2 0l8 4.21a2 2 0 0 1 1 1.85Z" />
      <path d="M22 22V11" />
      <path d="M15 22V11l-6-3" />
      <path d="M2 11l6-3" />
      <path d="M6 22V11" />
    </svg>
  ),
};
