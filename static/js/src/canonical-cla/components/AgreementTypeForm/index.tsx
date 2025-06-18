import { useSignForm } from "../../contexts/SignForm";
import { AgreementType, AgreementTypes } from "../../utils/constants";
import { RadioInput } from "@canonical/react-components";
import IndividualCla from "./IndividualCla";
import OrganizationCla from "./OrganizationCla";
import React from "react";

const AGREEMENT_TYPES: Record<
  AgreementType,
  {
    label: string;
    description?: React.ReactElement;
    agreement: () => React.ReactElement;
  }
> = {
  individual: {
    label: "I am signing as an individual contributor.",
    description: (
      <div>
        <div className="p-notification--information is-borderless u-no-margin--bottom">
          <div className="p-notification__content">
            <p className="p-notification__message">
              <strong>Time to get access:</strong> instant
            </p>
          </div>
        </div>
        <p className="u-text--muted">
          The individual contributor agreement is designed for individuals
          contributing personally (not on behalf of a company or organization).
          Individual contributors should use their personal email account. If
          you choose to sign with a corporate email account, please ensure that
          you are legally permitted to do so.
        </p>
      </div>
    ),
    agreement: IndividualCla,
  },
  organization: {
    label:
      "I am signing on behalf of an organization, foundation, company or other entity, which may have multiple contributors.",
    description: (
      <div>
        <div className="p-notification--information is-borderless u-no-margin--bottom">
          <div className="p-notification__content">
            <p className="p-notification__message">
              <strong>Time to get access:</strong> 4-8 weeks
            </p>
          </div>
        </div>
        <p className="u-text--muted">
          The corporate contributor agreement is designed to accommodate
          companies that do not permit their employees to sign individual
          contributor agreements. This procedure requires manual review and
          manual signatures by both parties via DocuSign. If your employer
          allows you to sign an individual CLA agreement, we recommend you to
          use it instead.
        </p>
      </div>
    ),
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
      {AgreementTypes.map((agreementType, index) => (
        <>
          <div className="p-strip is-shallow" key={agreementType}>
            <RadioInput
              id={agreementType}
              name="agreementType"
              label={AGREEMENT_TYPES[agreementType].label}
              labelClassName="p-heading--5"
              value={agreementType}
              checked={selectedAgreementType === agreementType}
              onChange={() => changeAgreementType(agreementType)}
            />
            {AGREEMENT_TYPES[agreementType].description}
          </div>
          {index < AgreementTypes.length - 1 && (
            <hr className="p-rule--muted" />
          )}
        </>
      ))}
      {selectedAgreementType &&
        AGREEMENT_TYPES[selectedAgreementType].agreement()}
    </section>
  );
};

export default AgreementTypeForm;
