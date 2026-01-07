export const removeDuplicates = (array) => {
  if (!Array.isArray(array)) return array;

  return array.filter((item, index) => {
    const stringified = JSON.stringify(item);
    return (
      index === array.findIndex((obj) => JSON.stringify(obj) === stringified)
    );
  });
};
