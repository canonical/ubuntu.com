export async function getFilteredWebhookResponses(abilityScreenId, page) {
  let response = await fetch(`/credentials/get_filtered_webhook_responses?ability_screen_id=${abilityScreenId}&page=${page}`, {
    method: "GET",
  });
  const data = await response.json();
  return data;
}
