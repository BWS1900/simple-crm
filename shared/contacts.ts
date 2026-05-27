export type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

export function cleanContactName(value: string): string {
  return value.trim().slice(0, 100);
}

export function cleanEmail(value: string): string {
  return value.trim().slice(0, 200);
}

export function cleanPhone(value: string): string {
  return value.trim().slice(0, 30);
}

export function cleanCompany(value: string): string {
  return value.trim().slice(0, 100);
}

export function cleanNotes(value: string): string {
  return value.trim().slice(0, 500);
}
