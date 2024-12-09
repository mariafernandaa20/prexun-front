export default function CobrosPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Cobros</h1>
      <div className="grid gap-4">
        {/* Example data */}
        {[
          { id: 1, estudiante: "Juan Pérez", monto: 1500, fecha: "2024-03-15", estado: "Pagado" },
          { id: 2, estudiante: "María García", monto: 1500, fecha: "2024-03-14", estado: "Pendiente" },
          { id: 3, estudiante: "Carlos López", monto: 1500, fecha: "2024-03-13", estado: "Pagado" },
        ].map((cobro) => (
          <div key={cobro.id} className="p-4 border rounded-lg">
            <p>Estudiante: {cobro.estudiante}</p>
            <p>Monto: ${cobro.monto}</p>
            <p>Fecha: {cobro.fecha}</p>
            <p>Estado: {cobro.estado}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 