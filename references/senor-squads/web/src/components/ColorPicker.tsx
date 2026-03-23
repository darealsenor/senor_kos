import React, { useState } from "react";
import { GithubPicker } from "react-color";

interface ColorPickerProps {
  defaultColor: string;
  onColorChange?: (color: string) => void;
}

const ColorPicker = ({ defaultColor, onColorChange }: ColorPickerProps) => {
  const [color, setColor] = useState(defaultColor);
  const [displayPicker, setDisplayPicker] = useState(false);

  const handleColorClick = () => {
    setDisplayPicker(!displayPicker);
  };

  const handlePickerClose = () => {
    setDisplayPicker(false);
  };

  const handlePickerChange = (newColor) => {
    const hexColor = newColor.hex;
    setColor(hexColor);
    if (onColorChange) {
      onColorChange(hexColor);
    }
  };

  return (
    <div className="relative flex justify-center items-center">
      <div
        className="rounded cursor-pointer shadow-md inline-block"
        style={{
          width: "4.5rem",
          height: "1.3rem",
          border: "1px solid rgba(255, 255, 255, 1)",
          backgroundColor: color,
        }}
        onClick={handleColorClick}
      >
        {/* The clickable color display area */}
      </div>

      {displayPicker && (
        <div style={{ position: "absolute", zIndex: "2", top: "2rem" }}>
          <div
            style={{ position: "fixed", top: "0px", right: "0px", bottom: "0px", left: "0px" }}
            onClick={handlePickerClose}
          />
          <GithubPicker color={color} onChange={handlePickerChange} />
        </div>
      )}
    </div>
  );
};

export default ColorPicker;