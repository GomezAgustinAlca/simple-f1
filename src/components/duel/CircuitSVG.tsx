"use client"

import { forwardRef } from "react"
import type { CircuitDef } from "./circuitData"

interface CircuitSVGProps {
  circuit: CircuitDef
  carAColor: string
  carBColor: string
  carARef: React.RefObject<SVGGElement | null>
  carBRef: React.RefObject<SVGGElement | null>
  pathRef: React.RefObject<SVGPathElement | null>
}

function CarShape({ color }: { color: string }) {
  return (
    <>
      {/* Body */}
      <rect x="-9" y="-2.5" width="18" height="5" rx="2" fill={color} />
      {/* Nose cone */}
      <polygon points="9,-1.5 13.5,0 9,1.5" fill={color} />
      {/* Rear wing */}
      <rect x="-10" y="-3.5" width="3" height="7" rx="1" fill={color} opacity="0.85" />
      {/* Front left wheel */}
      <rect x="4" y="-4.5" width="3.5" height="2.5" rx="1" fill="#1a1a1a" />
      {/* Front right wheel */}
      <rect x="4" y="2" width="3.5" height="2.5" rx="1" fill="#1a1a1a" />
      {/* Rear left wheel */}
      <rect x="-8" y="-4.5" width="3.5" height="2.5" rx="1" fill="#1a1a1a" />
      {/* Rear right wheel */}
      <rect x="-8" y="2" width="3.5" height="2.5" rx="1" fill="#1a1a1a" />
      {/* Cockpit */}
      <ellipse cx="1" cy="0" rx="3.5" ry="1.8" fill={color} opacity="0.7" />
    </>
  )
}

export const CircuitSVG = forwardRef<SVGSVGElement, CircuitSVGProps>(
  ({ circuit, carAColor, carBColor, carARef, carBRef, pathRef }, ref) => {
    return (
      <svg
        ref={ref}
        viewBox={circuit.viewBox}
        className="w-full"
        style={{ minWidth: "600px", minHeight: "400px", overflow: "visible" }}
      >
        {/* Track outline (thick grey base) */}
        <path
          d={circuit.path}
          fill="none"
          stroke="#d1d5db"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Track surface */}
        <path
          d={circuit.path}
          fill="none"
          stroke="#374151"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Centre line */}
        <path
          d={circuit.path}
          fill="none"
          stroke="#4b5563"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="6 4"
        />
        {/* Hidden path for length calculation */}
        <path
          ref={pathRef}
          d={circuit.path}
          fill="none"
          stroke="none"
          strokeWidth="0"
        />

        {/* Car A */}
        <g ref={carARef} style={{ opacity: 0 }}>
          <g transform="scale(2)">
            <CarShape color={carAColor} />
            <circle cx="0" cy="-7" r="3" fill={carAColor} stroke="white" strokeWidth="1" />
            <text x="0" y="-10.5" textAnchor="middle" fontSize="5" fill={carAColor} fontWeight="bold">A</text>
          </g>
        </g>

        {/* Car B */}
        <g ref={carBRef} style={{ opacity: 0 }}>
          <g transform="scale(2)">
            <CarShape color={carBColor} />
            <circle cx="0" cy="7" r="3" fill={carBColor} stroke="white" strokeWidth="1" />
            <text x="0" y="14" textAnchor="middle" fontSize="5" fill={carBColor} fontWeight="bold">B</text>
          </g>
        </g>
      </svg>
    )
  }
)

CircuitSVG.displayName = "CircuitSVG"
