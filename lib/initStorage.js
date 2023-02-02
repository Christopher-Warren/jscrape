import Storage from "node-storage";

export function initStorage() {
  const store = new Storage("./store.json");

  if (Object.keys(store.store).length === 0) {
    store.put("jobs", []);
  }
}
