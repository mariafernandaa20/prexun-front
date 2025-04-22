export async function addContactToGoogle(token: string, contact: {
    name: string;
    email: string;
    phone: string;
  }) {
    const response = await fetch("https://people.googleapis.com/v1/people:createContact", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        names: [{ givenName: contact.name }],
        emailAddresses: [{ value: contact.email }],
        phoneNumbers: [{ value: contact.phone }],
      }),
    });
  
    if (!response.ok) {
      throw new Error("Error al crear el contacto en Google");
    }
  
    return response.json();
  }
  