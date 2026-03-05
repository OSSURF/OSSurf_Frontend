import * as React from "react";
import type { SVGProps } from "react";
const SvgAlertCircleStrokeRounded = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={32}
    height={32}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1}
    color="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <circle cx={12} cy={12} r={10} />
    <path d="M12 8v4.5M12 15.988v.01" />
  </svg>
);
export default SvgAlertCircleStrokeRounded;
