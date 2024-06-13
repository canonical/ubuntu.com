export async function listAllKeys(contractId) {
  let response = await fetch(`/credentials/keys/list`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  for (let key in data) {
    data[key]["expirationDate"] = new Date(data[key]["expirationDate"]);
  }
  return data.reverse();
}

export async function rotateKey(activationKey) {
  let response = await fetch(`/credentials/keys/rotate/${activationKey}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  return data;
}
