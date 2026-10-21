jest.mock("intl-tel-input");

const modalForm = `
  <div class="js-modal-ready">
    <select id="country"><option value="gb">UK</option></select>
    <div><div class="iti"><input id="phone" /></div></div>
  </div>`;

beforeEach(() => {
  jest.resetModules();
  document.body.innerHTML = modalForm;
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => ({ country_code: "gb" }) }),
  );
});

test("leaves modal form inputs alone on page load", async () => {
  await import("./prepare-form-inputs.js");
  expect(global.fetch).not.toHaveBeenCalled();
});

test("prepares the same inputs only once", async () => {
  const { prepareInputFieldsOnce } = await import("./prepare-form-inputs.js");
  const phone = document.querySelector("#phone");
  const country = document.querySelector("#country");
  await prepareInputFieldsOnce(phone, country);
  await prepareInputFieldsOnce(phone, country);
  expect(global.fetch).toHaveBeenCalledTimes(1);
});
