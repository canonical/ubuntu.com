export async function listAllKeys(contractId) {
  let response = await fetch(`/credentialling/keys/list/${contractId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    }
  });
  const data = await response.json();
  for (let key in data) {
    data[key]["expirationDate"] = new Date(data[key]["expirationDate"]);
  };
  return data;
} 
