import { type LucideProps } from "lucide-react";

export const Treasure = (props: LucideProps) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 8h20l-2 10H4L2 8z" />
    <path d="M7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
    <path d="M12 8v8" />
    <path d="M8 12h8" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);