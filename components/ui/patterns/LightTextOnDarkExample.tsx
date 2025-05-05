import React from "react";

/**
 * Example: Enforcing light text on dark or vibrant backgrounds.
 */
export const LightTextOnDarkCard = () => (
  <div className="bg-primary-700 p-6 rounded-lg shadow-md">
    <h3 className="text-xl font-bold text-custom-white mb-2">Accessible Card Title</h3>
    <p className="text-custom-white mb-4">
      All text here uses our project’s approved light text utility for excellent contrast.
    </p>
    <button className="bg-accent-600 hover:bg-accent-700 text-custom-white px-4 py-2 rounded">
      Emphasized Action
    </button>
  </div>
);

// Dark mode variant example
export const LightTextOnDarkCardDarkMode = () => (
  <div className="bg-primary-950 p-6 rounded-lg shadow-md dark:bg-primary-800">
    <h3 className="text-xl font-bold text-custom-white mb-2 dark:text-custom-white">Dark Mode Card Title</h3>
    <p className="text-custom-white mb-4 dark:text-custom-white">
      Always use light text on dark, saturated, or gradient backgrounds.
    </p>
  </div>
);