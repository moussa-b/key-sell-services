export class Address {
  id: number;
  street: string;
  complement?: string;
  zipCode: string;
  city: string;
  countryCode: string;

  constructor(address: { [key: string]: any }) {
    if (!address) {
      return;
    }
    this.id = address['id'];
    this.street = address['street'];
    this.complement = address['complement'];
    this.zipCode = address['zipCode'];
    this.city = address['city'];
    this.countryCode = address['countryCode'];
  }

  isValid(): boolean {
    return (
      this.zipCode?.length > 0 &&
      this.city?.length > 0 &&
      this.countryCode?.length > 0
    );
  }

  isEmpty(): boolean {
    return (
      !(this.street?.length > 0) &&
      !(this.zipCode?.length > 0) &&
      !(this.city?.length > 0) &&
      !(this.countryCode?.length > 0)
    );
  }

  isNotEmpty(): boolean {
    return !this.isEmpty();
  }
}
