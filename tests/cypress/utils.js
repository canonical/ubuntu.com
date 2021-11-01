export const getTestURL = (URL) => `${URL}?test_backend=true`;
export const getRandomEmail = () =>
  `cypress-test-${Math.random().toString(36).substr(2, 10)}@canonical.com`;

export const getNewTestCredentials = () => {
  const id = Math.random().toString(36).substr(2, 10);

  return {
    username: id,
    email: `cypress-test+${id}@gmail.com`,
    password: "jibfdq5hmq1",
  };
};
