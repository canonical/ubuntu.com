export async function listAllResults() {
  let response = await fetch(`/credentials/results?ability_screen_id=4229`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  for (let key in data) {
    data[key]["expires_at"] = new Date(data[key]["expires_at"]);
    data[key]["completed_at"] = new Date(data[key]["completed_at"]);
  }
  return data;
}
