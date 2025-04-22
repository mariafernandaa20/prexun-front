// utils/googleContacts.ts
export async function addContactToGoogle(accessToken: string, contact: {
  name: string;
  email: string;
  phone: string;
}) {
  const response = await fetch("https://people.googleapis.com/v1/people:createContact", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      names: [{ givenName: contact.name }],
      emailAddresses: [{ value: contact.email }],
      phoneNumbers: [{ value: contact.phone }],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Error al agregar contacto");
  }
}
