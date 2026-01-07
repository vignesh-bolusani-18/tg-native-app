/**
 * Deeply compares two JSON objects for equality
 * @param {any} obj1 - First JSON object
 * @param {any} obj2 - Second JSON object
 * @returns {boolean} - True if objects are deeply equal, false otherwise
 */
function deepEqual(obj1, obj2) {
    // Check if the objects are directly equal (same reference or primitive value)
    if (obj1 === obj2) return true;
    
    // If either is null or not an object, they're not equal (since we've checked === above)
    if (obj1 === null || obj2 === null || typeof obj1 !== 'object' || typeof obj2 !== 'object') {
      return false;
    }
    
    // Handle Date objects
    if (obj1 instanceof Date && obj2 instanceof Date) {
      return obj1.getTime() === obj2.getTime();
    }
    
    // Handle Array objects
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      if (obj1.length !== obj2.length) return false;
      
      // Check each element recursively
      for (let i = 0; i < obj1.length; i++) {
        if (!deepEqual(obj1[i], obj2[i])) return false;
      }
      return true;
    }
    
    // For regular objects, check that they have the same keys and values
    
    // Get keys from both objects
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    // Check if they have the same number of keys
    if (keys1.length !== keys2.length) return false;
    
    // Check if they have the same keys and if the values are equal
    for (const key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!deepEqual(obj1[key], obj2[key])) return false;
    }
    
    return true;
  }
  
  /**
   * Wrapper function to compare two JSON strings or objects
   * @param {string|object} json1 - First JSON string or object
   * @param {string|object} json2 - Second JSON string or object 
   * @returns {boolean} - True if JSONs are deeply equal, false otherwise
   */
 export function areJsonEqual(json1, json2) {
    try {
      // Parse JSON strings if needed
      const obj1 = typeof json1 === 'string' ? JSON.parse(json1) : json1;
      const obj2 = typeof json2 === 'string' ? JSON.parse(json2) : json2;
      
      // Compare the parsed objects deeply
      return deepEqual(obj1, obj2);
    } catch (error) {
      console.error("Error comparing JSON objects:", error.message);
      return false;
    }
  }
  
 
  
