export const listSubscriptions = async () => {
  const response = await fetch(`/portal-proxy/api/subscriptions`);
  return response.json();
};
