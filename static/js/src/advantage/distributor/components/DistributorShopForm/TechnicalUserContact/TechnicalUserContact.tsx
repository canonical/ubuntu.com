import React, { useContext } from "react";
import { Input, Notification } from "@canonical/react-components";
import { FormContext } from "advantage/distributor/utils/FormContext";
import { DISTRIBUTOR_SELECTOR_KEYS } from "advantage/distributor/utils/utils";

const TechnicalUserContact = () => {
  const { technicalUserContact, setTechnicalUserContact } =
    useContext(FormContext);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    const captializeNameValue =
      name === "name"
        ? value
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
        : value;

    setTechnicalUserContact({
      ...technicalUserContact,
      [name]: captializeNameValue,
    });

    localStorage.setItem(
      DISTRIBUTOR_SELECTOR_KEYS.TECHNICAL_USER_CONTACT,
      JSON.stringify({
        ...technicalUserContact,
        [name]: captializeNameValue,
      }),
    );
  };

  return (
    <div data-testid="wrapper">
      <div>
        <Input
          id="technical-user-name"
          aria-label="Technical user name"
          label="Technical user name"
          name="name"
          type="text"
          placeholder="Ex: John Doe"
          required
          onChange={handleChange}
          value={technicalUserContact.name}
        />
      </div>
      <div>
        <Input
          id="technical-user-email"
          aria-label="Technical user email"
          label="Technical user email"
          name="email"
          type="email"
          placeholder="Ex: person@enduser.com"
          required
          onChange={handleChange}
          value={technicalUserContact.email}
        ></Input>
      </div>
      <Notification severity="caution" title="Warning">
        Make sure the information here is correct. This cannot be changed after
        the checkout is completed.
      </Notification>
    </div>
  );
};

export default TechnicalUserContact;
