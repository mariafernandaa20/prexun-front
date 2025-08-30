// utils/googleContacts.ts

export interface GoogleContact {
  resourceName: string;
  etag: string;
  names?: Array<{
    displayName: string;
    givenName?: string;
    familyName?: string;
  }>;
  emailAddresses?: Array<{
    value: string;
    type?: string;
  }>;
  phoneNumbers?: Array<{
    value: string;
    type?: string;
  }>;
}

export async function addContactToGoogle(accessToken: string, contact: {
  name: string;
  email: string;
  phone: string;
  secondaryPhone: string;
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
      phoneNumbers: [{ value: contact.phone  }, {value: contact.secondaryPhone}],
    }),
    
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Error al agregar contacto");
  }
}

export async function getGoogleContacts(accessToken: string, pageSize: number = 100) {
  const response = await fetch(
    `https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers&pageSize=${pageSize}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Error al obtener contactos");
  }

  const data = await response.json();
  return data.connections || [];
}
