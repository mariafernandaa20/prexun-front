export default function CohertsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Cohortes</h1>
      <div className="grid gap-4">
        {/* Example data */}
        {[
          { id: 1, nombre: "2024-A", estudiantes: 25, fechaInicio: "2024-01-15", estado: "En curso" },
          { id: 2, nombre: "2024-B", estudiantes: 30, fechaInicio: "2024-03-01", estado: "En curso" },
          { id: 3, nombre: "2023-C", estudiantes: 28, fechaInicio: "2023-09-01", estado: "Finalizado" },
        ].map((cohorte) => (
          <div key={cohorte.id} className="p-4 border rounded-lg">
            <p>Nombre: {cohorte.nombre}</p>
            <p>Estudiantes: {cohorte.estudiantes}</p>
            <p>Fecha de inicio: {cohorte.fechaInicio}</p>
            <p>Estado: {cohorte.estado}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 