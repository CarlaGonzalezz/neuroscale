// pdf-generator.js
async function exportPatientReport(uid, patientId, patient, evals) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const COLOR_PRIMARY = '#1e3a5f';
  const MARGIN_X = 20;
  let y = 20;
/* Header */
  doc.setTextColor(COLOR_PRIMARY);
  doc.setFontSize(16);
  doc.text('INFORME DE EVALUACIÓN NEUROLÓGICA', MARGIN_X, y);
  y += 10;
  doc.setFontSize(10);
  doc.text(`Fecha de emisión: ${new Date().toLocaleString()}`, MARGIN_X, y);
  y += 12;
/* Médico */
  const user = auth.currentUser;
  const profSnap = await db.ref(`medicos/${user.uid}`).get();
  const m = profSnap.val() || {};
  doc.setTextColor(0);
  doc.text(`Médico: ${m.nombre || user.email}`, MARGIN_X, y); y += 6;
  doc.text(`Matrícula: ${m.matricula || '-'}`, MARGIN_X, y); y += 6;
  doc.text(`Especialidad: ${m.especialidad || '-'}`, MARGIN_X, y); y += 6;
  doc.text(`Hospital: ${m.hospital || '-'}`, MARGIN_X, y); y += 12;
/* Paciente */
  doc.setFontSize(12);
  doc.text(`Paciente: ${patient.nombre} ${patient.apellido}`, MARGIN_X, y); y += 6;
  doc.text(`DNI: ${patient.dni}`, MARGIN_X, y); y += 6;
  doc.text(`Edad: ${patient.edad}`, MARGIN_X, y); y += 6;
  doc.text(`Diagnóstico: ${patient.diagnostico}`, MARGIN_X, y); y += 12;
/* Tabla */
  const rows = evals.map(e => [
    e.fecha?.slice(0, 10) || '-',
    e.escalaNombre,
    e.puntajeTotal ?? '-',
    e.interpretacion || '-'
  ]);
  doc.autoTable({
    startY: y,
    margin: { left: MARGIN_X, right: MARGIN_X },
    head: [['Fecha', 'Escala', 'Puntaje', 'Interpretación']],
    body: rows,
    headStyles: {
      fillColor: COLOR_PRIMARY,
      textColor: 255
    },
    styles: {
      fontSize: 9,
      cellPadding: 4
    }
  });
/* Agrupar por escala */
  const byScale = {};
  evals.forEach(e => {
    const key = e.escalaId || e.escalaNombre;
    if (!byScale[key]) {
      byScale[key] = { name: e.escalaNombre, data: [] };
    }
    byScale[key].data.push(e);
  });
/* Gr+aficos */
  for (const key in byScale) {
    const scale = byScale[key];
    const ordered = scale.data.sort(
      (a, b) => new Date(a.fecha) - new Date(b.fecha)
    );
    const labels = ordered.map(e => e.fecha.slice(0, 10));
    const values = ordered.map(e => e.puntajeTotal);
    doc.addPage();
    doc.setTextColor(COLOR_PRIMARY);
    doc.setFontSize(14);
    doc.text(`Evolución clínica – ${scale.name}`, MARGIN_X, 20);
    doc.setFontSize(10);
    doc.setTextColor(90);
    doc.text(
      'Puntaje total obtenido en evaluaciones sucesivas',
      MARGIN_X,
      28
    );
/* Canvas fuera del DOM */
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 450;
    const chart = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: values,
          borderColor: COLOR_PRIMARY,
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: COLOR_PRIMARY,
          tension: 0.3
        }]
      },
      options: {
        responsive: false,
        animation: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
    // esperar render
    await new Promise(resolve => setTimeout(resolve, 300));
    const img = canvas.toDataURL('image/png', 1.0);
    doc.addImage(img, 'PNG', MARGIN_X, 40, 170, 90);
    chart.destroy();
  }
/* Footer */
  const ph = doc.internal.pageSize.getHeight();
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    'NeuroScale © desarrollado por Carla González',
    MARGIN_X,
    ph - 10
  );
  doc.save(`reporte-${patient.apellido}-${patient.nombre}.pdf`);
}