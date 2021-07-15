import React, { useEffect, useState } from "react";
import anime from "animejs";

export interface ProgressLoaderProps {
  height: number;
  width: number;
  borderWidth: number;
  progress: number;
  borderColor?: string;
}

export const ProgressLoader = ({
  height,
  width,
  borderWidth,
  progress,
  borderColor,
}: ProgressLoaderProps) => {
  const perimenter = Math.round((2 * Math.PI * width) / 2);
  useEffect(() => {
    const temp = anime({
      targets: "#circle-outer",
      strokeDasharray: ["0 785", " 785 785"],
      duration: 750,
      easing: "cubicBezier(0.000, 0.745, 0.695, 1.000)",
      autoplay: false,
    });

    const text = anime({
      targets: "#text",
      translateY: [-10, 0],
      opacity: [0, 1],
      easing: "easeInOutQuad",
      autoplay: false,
      duration: 500,
    });

    setTimeout(() => {
      temp.restart();
      text.restart();
    }, 500);
  }, []);

  useEffect(() => {
    if (progress > 0) {
      anime({
        targets: "#circle-progress",
        strokeDasharray: [`${(progress * perimenter) / 100} ${perimenter}`],
        duration: 250,
        easing: "linear",
      });
    }
  }, [progress]);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width, height }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox={`0 0 ${width + borderWidth * 2} ${height + borderWidth * 2}`}
        className="absolute"
      >
        <defs>
          <filter
            id="prefix__a"
            x={0}
            y={0}
            width={width}
            height={height}
            filterUnits="userSpaceOnUse"
          >
            <feOffset dy={3} />
            <feGaussianBlur stdDeviation={3} result="blur" />
            <feFlood floodOpacity={0.161} />
            <feComposite operator="in" in2="blur" />
            <feComposite in="SourceGraphic" />
          </filter>
        </defs>
        <g
          data-name="Group 1"
          transform={`translate(${borderWidth},${borderWidth})`}
        >
          <circle
            data-name="Ellipse 1"
            id="circle-progress"
            cx={width / 2}
            cy={height / 2}
            r={width / 2}
            transform={`rotate(-90 ${width / 2} ${width / 2})`}
            fill="none"
            stroke={borderColor || "#ffb8b8"}
            strokeLinecap={progress ? "round" : "butt"}
            strokeLinejoin="round"
            strokeWidth={borderWidth}
            strokeDasharray={`${(progress * perimenter) / 100} ${perimenter}`}
          />
          <circle
            data-name="Ellipse 2"
            cx={width / 2}
            cy={height / 2}
            r={width / 2}
            id="circle-outer"
            transform={`rotate(-90 ${width / 2} ${width / 2})`}
            fill="none"
            stroke="#978a8a"
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth={borderWidth}
            strokeDasharray={`${perimenter} ${perimenter}`}
            opacity={0.1}
          />
        </g>
      </svg>
      <p
        id="text"
        className="text-6xl font-bold trans opacity-0"
        style={{ transform: "translateY(-30px)" }}
      >
        {progress}
        <span className="text-xl">%</span>
      </p>
    </div>
  );
};
