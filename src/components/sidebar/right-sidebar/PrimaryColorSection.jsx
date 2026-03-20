import React, { useContext, useEffect, useState } from "react";
import { DigiContext } from "../../../context/DigiContext";

const PrimaryColorSection = () => {
  const {
    handleRightSideDropdownToggle,
    rightSideDropdown,
    primaryColor,
    handleColorSelectionToggle,
    showConfirm,
    setShowConfirm,
    confirmYN,
    setConfirmYN,
  } = useContext(DigiContext);
  const [showBackgroundBox, setShowBackgroundBox] = useState(
    rightSideDropdown.primaryColor,
  );

  const handleToggle = () => {
    handleRightSideDropdownToggle("primaryColor");
    setShowBackgroundBox((prevState) => !prevState);
  };

  // const chngClrConfirm = () => {
  // const result = window.confirm("Are you sure you want to change the color?");
  // setShowConfirm(true)
  //     return false;
  // };

  //   useEffect(() => {
  //     console.log(primaryColor)
  //   }, [primaryColor]);

  const [color, setColor] = useState("");

  useEffect(() => {
    console.log("confirm yn :", confirmYN);
    if (confirmYN) {
      console.log("color is", color);
      if (color) {
        handleColorSelectionToggle(color);
        setTimeout(() => {
          location.reload();
        }, 500);
      }
    }
  }, [confirmYN]);

  return (
    <div className="right-sidebar-group">
      <span className="sidebar-subtitle">
        Primary Color
        <span>
          <i
            className={`fa-light ${rightSideDropdown.primaryColor ? "fa-angle-up" : "fa-angle-down"}`}
            role="button"
            onClick={handleToggle}
          ></i>
        </span>
      </span>
      <div className={`settings-row-2 ${showBackgroundBox ? "show" : "hide"}`}>
        <button
          className={`color-palette color-palette-1 ${primaryColor.blue ? "active" : ""}`}
          onClick={() => {
            setColor("blue");
            setShowConfirm(true);
          }}
        >
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <button
          className={`color-palette color-palette-2 ${primaryColor.orange ? "active" : ""}`}
          onClick={() => {
            setColor("orange");
            setShowConfirm(true);
          }}
        >
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <button
          className={`color-palette color-palette-3 ${primaryColor.pink ? "active" : ""}`}
          onClick={() => {
            setColor("pink");
            setShowConfirm(true);
          }}
        >
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <button
          className={`color-palette color-palette-4 ${primaryColor.eagle_green ? "active" : ""}`}
          onClick={() => {
            setColor("eagle_green");
            setShowConfirm(true);
          }}
        >
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <button
          className={`color-palette color-palette-5 ${primaryColor.purple ? "active" : ""}`}
          onClick={() => {
            setColor("purple");
            setShowConfirm(true);
          }}
        >
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <button
          className={`color-palette color-palette-6 ${primaryColor.gold ? "active" : ""}`}
          onClick={() => {
            setColor("gold");
            setShowConfirm(true);
          }}
        >
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <button
          className={`color-palette color-palette-7 ${primaryColor.green ? "active" : ""}`}
          onClick={() => {
            setColor("green");
            setShowConfirm(true);
          }}
        >
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <button
          className={`color-palette color-palette-8 ${primaryColor.deep_pink ? "active" : ""}`}
          onClick={() => {
            setColor("deep_pink");
            setShowConfirm(true);
          }}
        >
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <button
          className={`color-palette color-palette-9 ${primaryColor.tea_green ? "active" : ""}`}
          onClick={() => {
            setColor("tea_green");
            setShowConfirm(true);
          }}
        >
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <button
          className={`color-palette color-palette-10 ${primaryColor.yellow_green ? "active" : ""}`}
          onClick={() => {
            setColor("yellow_green");
            setShowConfirm(true);
          }}
        >
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
  );
};

export default PrimaryColorSection;
