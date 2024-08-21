import { useSignForm } from "../../contexts/SignForm";
import { AgreementType, AgreementTypes } from "../../utils/constants";
import { RadioInput } from "@canonical/react-components";
import IndividualCla from "./IndividualCla";
import OrganizationCla from "./OrganizationCla";
import React from "react";

const AGREEMENT_TYPES: Record<
  AgreementType,
  { label: string; agreement: () => React.ReactElement }
> = {
  individual: {
    label: "I am signing as an individual contributor.",
    agreement: IndividualCla,
  },
  organization: {
    label:
      "I am signing on behalf of an organization, foundation, company or other entity, which may have multiple contributors.",
    agreement: OrganizationCla,
  },
};

const AgreementTypeForm = () => {
  const { agreementType: selectedAgreementType, changeAgreementType } =
    useSignForm();

  return (
    <section>
      <label htmlFor="agreementType" className="p-heading--2">
        Agreement type
      </label>
      {AgreementTypes.map((agreementType) => (
        <RadioInput
          key={agreementType}
          id={agreementType}
          name="agreementType"
          label={AGREEMENT_TYPES[agreementType].label}
          value={agreementType}
          checked={selectedAgreementType === agreementType}
          onChange={() => changeAgreementType(agreementType)}
        />
      ))}
      {/* {selectedAgreementType &&
        AGREEMENT_TYPES[selectedAgreementType].agreement()} */}
    </section>
  );
};

export default AgreementTypeForm;
