import * as React from "react";

function Close(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="1em"
      viewBox="0 0 24 24"
      width="1em"
      fill="currentColor"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.7 2l6.358 6.243L18.416 2 22 5.584l-6.243 6.358L22 18.301 18.416 22l-6.358-6.36-6.359 6.36L2 18.3l6.358-6.359L2 5.584 5.7 2z"
      />
    </svg>
  );
}

export default Close;
