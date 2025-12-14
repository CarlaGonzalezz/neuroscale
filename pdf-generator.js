// pdf-generator.js
async function exportPatientReport(uid, patientId, patient, evals, chartCanvas) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
// Header
doc.setFontSize(16);
doc.text('INFORME DE EVALUACIÓN NEUROLÓGICA', 14, 18);
doc.setFontSize(10);
doc.text(`Fecha de emisión: ${new Date().toLocaleString()}`, 14, 26);
// Datos del médico
const user = auth.currentUser;
const profSnap = await db.ref(`medicos/${user.uid}`).get();
const m = profSnap.val() || {};
doc.text(`Médico: ${m.nombre || user.email}`, 14, 34);
doc.text(`Matrícula: ${m.matricula || '-'}`, 14, 40);
doc.text(`Especialidad: ${m.especialidad || '-'}`, 14, 46);
doc.text(`Hospital: ${m.hospital || '-'}`, 14, 52);
// Datos del paciente
doc.setFontSize(12);
doc.text(`Paciente: ${patient.nombre} ${patient.apellido}`, 14, 64);
doc.text(`DNI: ${patient.dni}`, 14, 70);
doc.text(`Edad: ${patient.edad}`, 14, 76);
doc.text(`Diagnóstico: ${patient.diagnostico}`, 14, 82);
// Tabla de evaluaciones
const rows = evals.map(e => [
  e.fecha.slice(0,10),
  e.escalaNombre,
  e.puntajeTotal,
  e.interpretacion || '-'
]);
doc.autoTable({
  startY: 90,
  head: [['Fecha', 'Escala', 'Puntaje', 'Interpretación']],
  body: rows
});
// Gráfico de evolución temporal
if (chartCanvas) {
  const chartImg = chartCanvas.toDataURL('image/png', 1.0);
  doc.addImage(chartImg, 'PNG', 14, doc.lastAutoTable.finalY + 10, 180, 80);
}
// Footer
const pageHeight = doc.internal.pageSize.getHeight();
doc.setFontSize(9);
doc.text('NeuroScale © desarrollado por Carla González', 14, pageHeight - 10);
doc.save(`reporte-${patient.apellido}-${patient.nombre}.pdf`);
}
