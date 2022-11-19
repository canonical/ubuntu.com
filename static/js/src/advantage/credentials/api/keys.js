export async function listAllKeys(contractId) {
  let response = await fetch(`/credentials/keys/list/${contractId}`, {
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

export async function activateKey(activationKey) {
  let response = await fetch("/credentials/keys/activate", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      activationKey: activationKey,
      productID: "cube-admintasks",
    }),
  });
  const data = await response.json();
  return data;
}
