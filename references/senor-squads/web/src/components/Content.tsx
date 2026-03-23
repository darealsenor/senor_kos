import React from "react";
import clsx from "clsx";

interface ContentProps {
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

const Content: React.FC<ContentProps> = ({ className, children, style }) => {
  return (
    <div
      className={clsx(
        "bg-white bg-opacity-[2%] py-[0.45rem] px-[0.55rem]",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
};

export default Content;
