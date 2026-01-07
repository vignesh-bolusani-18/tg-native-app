/**
 * Parallelizes work on an array by chunking and running each chunk in parallel.
 * @param {Array} data - The array to process.
 * @param {Function} workerFn - The function to run for each item (can be sync or async).
 * @param {number} chunkSize - How many items per chunk.
 * @returns {Promise<Array>} - Resolves to the flattened result array.
 */
export async function parallelChunkMap(data, workerFn, chunkSize = 10) {
  // Split data into chunks
  const chunks = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }

  // Process each chunk in parallel
  const chunkPromises = chunks.map((chunk) =>
    Promise.resolve(chunk.map(workerFn))
  );

  // Wait for all chunks to finish
  const chunkResults = await Promise.all(chunkPromises);

  // Flatten and return
  return chunkResults.flat();
}
