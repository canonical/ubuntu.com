import React, { useEffect, useState } from "react";
import { Input, Notification } from "@canonical/react-components";
import { Offer as OfferType } from "../../../../offers/types";

type Prop = {
  offer: OfferType;
};
const TechnicalUserContact = ({ offer }: Prop) => {
  const [technicalContact, setTechnicalContact] = useState({
    name: "",
    email: "",
  });
  useState;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTechnicalContact({
      ...technicalContact,
      [event.target.name]: event.target.value,
    });
    localStorage.setItem(
      `distributor-selector-technicalContact`,
      JSON.stringify({
        ...technicalContact,
        [event.target.name]: event.target.value,
      })
    );
  };

  useEffect(() => {
    const localTechnicalContact = localStorage.getItem(
      "distributor-selector-technicalContact"
    );
    const defaultValue =
      localTechnicalContact && JSON.parse(localTechnicalContact);
    if (defaultValue?.name) {
      setTechnicalContact({
        ...technicalContact,
        name: defaultValue.name,
        email: defaultValue.email,
      });
    } else {
      setTechnicalContact({
        ...technicalContact,
        name: offer?.end_user_account_name ?? "",
        email: offer?.technical_contact ?? "",
      });
    }
  }, [offer]);

  return (
    <div data-testid="wrapper">
      <div>
        <Input
          id="technical-user-name"
          aria-label="Technical user name"
          label="Technical user name"
          name="name"
          type="text"
          placeholder="Min Kim"
          required
          onChange={handleChange}
          value={technicalContact.name}
        />
      </div>
      <div>
        <Input
          id="technical-user-email"
          aria-label="Technical user email"
          label="Technical user email"
          name="email"
          type="email"
          placeholder="user@test.com"
          required
          onChange={handleChange}
          value={technicalContact.email}
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
