type Address = {
  street_address: string;
  city: string;
  state_province?: string;
  postal_code: string;
  country: string;
};

export const formatAddress = (address: Address) => {
  let formattedAddress = address.street_address;
  if (address.city) {
    formattedAddress += `, ${address.city}`;
  }
  if (address.postal_code) {
    formattedAddress += `, ${address.postal_code}`;
  }
  if (address.state_province) {
    formattedAddress += `, ${address.state_province}`;
  }
  return formattedAddress;
};
