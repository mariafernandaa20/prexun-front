import GoogleAuth from "./GoogleAuth";

export default function GooglePage() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Iniciar sesión con Google</h1>
      <GoogleAuth />
    </div>
  );
}
