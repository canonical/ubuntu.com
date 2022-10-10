export async function listAllKeys(contractId){
  let response = await fetch(`/credentialling/keys/list/${contractId}`,{
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    }
  });
  const data = await response.json();
  return data;
} 
