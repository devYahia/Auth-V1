interface User {
  firstName: string;
  secondName: string;
  email: string;
  phoneNumber: string;
}

interface UserUpdate {
  firstName?: string;
  secondName?: string;
  email?: string;
  phoneNumber?: string;
}

export type { User, UserUpdate };
