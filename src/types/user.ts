export type DeliveryAddress = {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

export type AccountPreferences = {
  marketingEmails: boolean;
  orderSmsUpdates: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: DeliveryAddress[];
  preferences: AccountPreferences;
  createdAt: string;
};
