import React from "react";
import spinner from "../assets/spinner.svg";

export default function Spinner() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="p-4 bg-white rounded-lg shadow-lg">
        <img src={spinner} alt="Loading" className="h-24 w-24 animate-spin" />
      </div>
    </div>
  );
}
