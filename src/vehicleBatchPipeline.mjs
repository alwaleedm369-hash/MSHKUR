/** Sequential, memory-conscious batch orchestration shared by browser and channel adapters. */
export async function runVehicleBatch(items, processItem, { onProgress = () => {}, stopOnError = false } = {}) {
  if (!Array.isArray(items) || items.length === 0) throw new Error("A batch must contain at least one image.");
  if (typeof processItem !== "function") throw new Error("A batch processor is required.");
  const results = [];
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    onProgress({ index, total: items.length, item, status: "processing" });
    try {
      const result = await processItem(item, index);
      const entry = { id: item.id ?? String(index), status: result?.review?.status === "passed" ? "ready" : "needs-review", result, error: null };
      results.push(entry);
      onProgress({ index, total: items.length, item, ...entry });
    } catch (error) {
      const entry = { id: item.id ?? String(index), status: "failed", result: null, error: error instanceof Error ? error.message : String(error) };
      results.push(entry);
      onProgress({ index, total: items.length, item, ...entry });
      if (stopOnError) break;
    }
  }
  return { total: items.length, completed: results.length, results, status: results.some(x => x.status === "failed") ? "completed-with-errors" : results.some(x => x.status === "needs-review") ? "needs-review" : "completed" };
}
