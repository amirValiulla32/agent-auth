import { SVGProps } from "react";

export function OakAuthIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7l-9-5z" fill="currentColor" stroke="none" />
      <path d="M9 12.5l2 2 4-4" stroke="#090c0a" strokeWidth="2.5" />
    </svg>
  );
}
