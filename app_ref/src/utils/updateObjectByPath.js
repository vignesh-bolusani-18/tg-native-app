/**
 * Updates a nested object property using a dot-notation path string
 * @param {Object} obj - The object to update
 * @param {string} path - The dot-notation path to the property (e.g., 'etl.input_data')
 * @param {*} value - The value to set at the specified path
 * @returns {Object} - The updated object
 */
const updateObjectByPath = (obj, path, value) => {
  // Create a copy of the object to avoid mutating the original
  const newObj = { ...obj };
  
  // Split the path into parts
  const parts = path.split('.');
  
  // Start with the root object
  let current = newObj;
  
  // Traverse the path
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    
    // If the current part doesn't exist, create an empty object
    if (!(part in current)) {
      current[part] = {};
    }
    
    // Move to the next level
    current = current[part];
  }
  
  // Set the value at the final path
  const lastPart = parts[parts.length - 1];
  current[lastPart] = value;
  
  return newObj;
};

export default updateObjectByPath; 