import { useRef } from "react";

export const HudColorPicker = ({ label, color, onChange, className = "" }) => {
  const colorInputRef = useRef(null);

  return (
    <div className={`bg-white bg-opacity-[5%] px-3 py-1 flex items-center justify-between ${className}`}>
      <span className="text-white text-xs font-gilroy font-semibold">{label}</span>
      <div
        className="rounded cursor-pointer shadow-md inline-block border border-white"
        style={{
          width: "4.5rem",
          height: "1.3rem",
          backgroundColor: color,
          border: "2px solid rgba(255, 255, 255, 1)",
        }}
        onClick={() => colorInputRef.current?.click()}
      >
        <input
          ref={colorInputRef}
          type="color"
          className="opacity-0 absolute cursor-pointer"
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
};

