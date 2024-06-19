import React, { useContext } from "react";
import { Input, Notification } from "@canonical/react-components";
import { FormContext } from "advantage/distributor/utils/FormContext";

const TechnicalUserContact = () => {
  const { techincalUserContact, setTechnicalUserContact } = useContext(
    FormContext
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTechnicalUserContact({
      ...techincalUserContact,
      [event.target.name]: event.target.value,
    });
    localStorage.setItem(
      `distributor-selector-techincalUserContact`,
      JSON.stringify({
        ...techincalUserContact,
        [event.target.name]: event.target.value,
      })
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
          placeholder="ex: Min Kim"
          required
          onChange={handleChange}
          value={techincalUserContact.name}
        />
      </div>
      <div>
        <Input
          id="technical-user-email"
          aria-label="Technical user email"
          label="Technical user email"
          name="email"
          type="email"
          placeholder="ex: person@enduser.com"
          required
          onChange={handleChange}
          value={techincalUserContact.email}
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
