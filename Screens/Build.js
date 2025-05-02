import React from 'react';
// No need for View import if PCBuilder handles its own root
import PCBuilder from '../Components/PCBuilder'; // Adjust path if PCBuilder is elsewhere

const Build = () => {
  // Directly render the main builder component
  return <PCBuilder />;
}

export default Build;