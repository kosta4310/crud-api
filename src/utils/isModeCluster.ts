export function isModeCluster() {
  const args = process.argv.slice(2);
  for (const arg of args) {
    if (arg.slice(2) === "cluster") {
      return true;
    }
  }
  return false;
}
