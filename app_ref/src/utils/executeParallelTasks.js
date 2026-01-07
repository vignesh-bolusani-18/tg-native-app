export async function executeParallelTasks(fnCalls) {
  const outputResults = await Promise.all(
    fnCalls.map(async ({ output, fn, args }) => {
      const result = await Promise.resolve(fn(...args));
      return output ? [output, result] : null;
    })
  );

  // Filter out unnamed (null) results and convert to object
  const filteredResults = outputResults.filter(Boolean);
  return Object.fromEntries(filteredResults);
}
