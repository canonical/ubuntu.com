export async function getFilteredWebhookResponses(API_KEY, abilityScreenId) {
  let response = await fetch(`https://app.trueability.com/api/v1/webhook_responses?ability_screen_id=${abilityScreenId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "X-API_KEY": API_KEY
    },
  });
  const data = await response.json();
  return data["webhook_responses"];
}
