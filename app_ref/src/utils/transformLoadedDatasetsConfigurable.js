export const transformLoadedDataSet = (obj, multi_select_dataset_tags) => {
  const transformed = {};

  Object.keys(obj).forEach((key) => {
    if (multi_select_dataset_tags.includes(key)) {
      transformed[`${key}_0`] = obj[key];
    } else if (Array.isArray(obj[key]) && obj[key].length > 1) {
      obj[key].forEach((item, index) => {
        transformed[`${key}_${index}`] = [item];
      });
    } else {
      transformed[key] = obj[key];
    }
  });

  /*   Object.keys(obj).forEach((key) => {
    if (["others", "bomothers", "future", "forecast"].includes(key)) {
      obj[key].forEach((item, index) => {
        transformed[`${key}_${index}`] = [item];
      });
    } else {
      transformed[key] = obj[key];
    }
  }); */

  return transformed;
};

// Example usage:
// const input = {
//   sales: [{ a: 1 }],
//   others: [{ b: 2 }, { c: 3 }],
//   future: [],
//   bom_mapping: [],
//   bom_inventory: [],
//   bomothers: [],
// };

// const transformed = transformLoadedDataSet(input);
// console.log(transformed);
