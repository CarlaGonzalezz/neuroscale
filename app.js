/* Utilidades / Variables globales */
const App = {
    currentUser: null,
    currentChart: null,
};
let notificationsReady = false;
function $(selector) {
    return document.querySelector(selector);
}
function $all(selector) {
    return Array.from(document.querySelectorAll(selector));
}
function safeText(v) {
    return v == null ? "-" : v;
}
/* Helper: escapeHtml (seguridad al renderizar) */
function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
/* Inicio: Autenticación y arranque */
window.addEventListener("DOMContentLoaded", () => {
    // Observador de auth
    auth.onAuthStateChanged(async (user) => {
      if (!user) {
        // si no está logueado redirige a auth
        window.location.href = "auth.html";
        return;
      }
      App.currentUser = user;
      // Inicia UI
      const doctorNameEl = document.getElementById("doctorName");
      if (doctorNameEl) doctorNameEl.textContent = user.email || "Dr.";
  
      setupNavigation();
      loadDashboardStats(user.uid);
      initInternalNotifications(user.uid);
      initPatients(user.uid);
      initScales(user.uid);
      initReports(user.uid);
      initProfile(user.uid);
    });
    // Logout
    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
      btnLogout.addEventListener("click", async () => {
        await auth.signOut();
        window.location.href = "auth.html";
      });
    }
    // Botón configuración abre perfil
    const btnSettings = document.getElementById("btnSettings");
    if (btnSettings) {
      btnSettings.addEventListener("click", () => {
        showView("profile");
      });
    }
});
/* Navegación entre vistas */
function setupNavigation() {
    const buttons = document.querySelectorAll(".nav-item");
    buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const view = btn.dataset.view;
        showView(view);
        });
    });
}
function showView(viewName) {
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    const el = document.getElementById(`view-${viewName}`);
    if (el) el.classList.add("active");
    // aseguro que si voy a pacientes se cargue la lista (si hace falta)
}
/* Dashboard: estadísticas */
async function loadDashboardStats(uid) {
  const patientsRef = db.ref(`pacientes/${uid}`);
  const evalsRef = db.ref(`evaluaciones/${uid}`);
/* CONTADOR DE PACIENTES */
  patientsRef.on("value", (snap) => {
      const count = snap.exists() ? Object.keys(snap.val()).length : 0;
      const el = document.getElementById("statPatients");
      if (el) el.textContent = count;
  });
/* EVALUACIONES */
  evalsRef.on("value", async (snap) => {
      try {
          const data = snap.val();
          if (!data) {
              document.getElementById("statEvalsMonth").textContent = "0";
              document.getElementById("statTotalEvals").textContent = "0";
              document.getElementById("lastEvaluatedList").innerHTML =
                  '<li style="color:#94a3b8;">No hay evaluaciones registradas</li>';
              return;
          }
          let monthCount = 0;
          let totalEvals = 0;
          const entries = [];
          const now = new Date();
          // map pacientes
          const patientsSnap = await patientsRef.get();
          const patientsMap = patientsSnap.exists() ? patientsSnap.val() : {};
/* RECORRER EVALUACIONES */
          Object.entries(data).forEach(([patientId, evalsObj]) => {
              Object.entries(evalsObj || {}).forEach(([evalId, ev]) => {
                  totalEvals++;
                  const fechaStr = ev.fecha || ev.createdAt || null;
                  // evaluaciones del mes
                  if (fechaStr) {
                      try {
                          const d = new Date(fechaStr);
                          if (
                              d.getMonth() === now.getMonth() &&
                              d.getFullYear() === now.getFullYear()
                          ) {
                              monthCount++;
                          }
                      } catch {
                          console.warn("Fecha inválida:", fechaStr);
                      }
                  }
                  // últimos evaluados
                  if (ev.estado === "completada") {
                      entries.push({
                          fecha: fechaStr,
                          escala: ev.escalaNombre || ev.escalaId || "Sin escala",
                          pacienteId: patientId, // ✅ CORREGIDO
                          puntaje: ev.puntajeTotal ?? null,
                          evalId
                      });
                  }
              });
          });
/* CONTADORES */
          document.getElementById("statEvalsMonth").textContent = monthCount;
          document.getElementById("statTotalEvals").textContent = totalEvals;
/* ÚLTIMOS EVALUADOS */
          entries.sort((a, b) => {
              const aTime = a.fecha ? new Date(a.fecha).getTime() : 0;
              const bTime = b.fecha ? new Date(b.fecha).getTime() : 0;
              return bTime - aTime;
          });
          const ul = document.getElementById("lastEvaluatedList");
          ul.innerHTML = "";
          const latest = entries.slice(0, 6);
          if (latest.length === 0) {
              ul.innerHTML = '<li style="color:#94a3b8;">No hay evaluaciones completadas</li>';
              return;
          }
          latest.forEach(item => {
              const patient = patientsMap[item.pacienteId] || {};
              const nombre = `${patient.nombre || ""} ${patient.apellido || ""}`.trim();
              const label = nombre || `Paciente ${item.pacienteId.slice(0, 8)}`;
              const fecha = item.fecha
                  ? new Date(item.fecha).toLocaleDateString("es-AR")
                  : "Sin fecha";
              const puntaje = item.puntaje != null ? ` - ${item.puntaje} pts` : "";
              const li = document.createElement("li");
              li.style.display = "flex";
              li.style.justifyContent = "space-between";
              li.style.padding = "10px 0";
              li.style.borderBottom = "1px solid #f1f5f9";
              li.innerHTML = `
                  <div>
                      <div style="font-weight:500;">${escapeHtml(label)}</div>
                      <div class="muted" style="font-size:.85rem;">
                          ${fecha} • ${escapeHtml(item.escala)}${puntaje}
                      </div>
                  </div>
                  <button 
                    class="btn-view-patient" 
                    data-patient-id="${item.pacienteId}"
                    title="Ver ficha del paciente"
                    style="
                    background:transparent;
                    border:none;
                    cursor:pointer;
                    padding:6px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    border-radius:4px;
                    transition:background 0.2s;"
                    onmouseover="this.style.background='#f1f5f9'"
                    onmouseout="this.style.background='transparent'">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path 
                      d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7z"
                      stroke="#1e3a5f"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"/>
                    <circle 
                    cx="12" 
                    cy="12" 
                    r="3"
                    stroke="#1e3a5f"
                    stroke-width="1.5"/>
                    </svg>
                  </button>
              `;
              ul.appendChild(li);
          });
/* VER FICHA */
          ul.onclick = async (e) => {
              const btn = e.target.closest(".btn-view-patient");
              if (!btn) return;
              const patientId = btn.dataset.patientId;
              showView("patients");
              document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
              document.querySelector('.nav-item[data-view="patients"]')?.classList.add("active");
              const detail = document.getElementById("patientDetail");
              if (detail) {
                  await showPatientDetail(uid, patientId, detail);
                  detail.scrollIntoView({ behavior: "smooth" });
              }
          };
      } catch (err) {
          console.error("Error en loadDashboardStats:", err);
          document.getElementById("lastEvaluatedList").innerHTML =
              '<li style="color:#ef4444;">Error al cargar evaluaciones</li>';
      }
  });
}
/* PACIENTES: CRUD + ficha + QR */
function initPatients(uid) {
    const listEl = document.getElementById("patientsList");
    const searchEl = document.getElementById("patientSearch");
    const modal = document.getElementById("patientFormModal");
    const detailEl = document.getElementById("patientDetail");
    // Nuevo paciente (abrir modal)
    const btnNew = document.getElementById("btnNewPatient");
    if (btnNew) {
      btnNew.addEventListener("click", () => {
        document.getElementById("patientFormTitle").textContent = "Nuevo paciente";
        ["pNombre", "pApellido", "pDni", "pEdad", "pDiagnostico"].forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.value = "";
        });
        modal.classList.remove("hidden");
      });
    }
    const btnCancel = document.getElementById("btnCancelPatient");
    if (btnCancel) btnCancel.addEventListener("click", () => modal.classList.add("hidden"));
    // Guardar paciente
    const btnSave = document.getElementById("btnSavePatient");
    if (btnSave) {
      btnSave.addEventListener("click", async () => {
        try {
          const nombre = document.getElementById("pNombre").value.trim();
          const apellido = document.getElementById("pApellido").value.trim();
          const dni = document.getElementById("pDni").value.trim();
          const edad = Number(document.getElementById("pEdad").value) || null;
          const diagnostico = document.getElementById("pDiagnostico").value.trim();
          if (!nombre || !apellido || !dni) {
            alert("Completá nombre, apellido y DNI.");
            return;
          }
          const newRef = db.ref(`pacientes/${uid}`).push();
          await newRef.set({
            nombre,
            apellido,
            dni,
            edad,
            diagnostico,
            fechaCreacion: new Date().toISOString(),
          });
          modal.classList.add("hidden");
        } catch (err) {
          console.error(err);
          alert("Error al guardar paciente: " + err.message);
        }
      });
    }
    // Renderizar pacientes
    function renderPatients(data) {
      listEl.innerHTML = "";
      const term = (searchEl?.value || "").toLowerCase();
      const obj = data || {};
      Object.entries(obj).forEach(([id, p]) => {
        // filtro simple por nombre/apellido/dni
        if (
          term &&
          !((p.nombre || "") + " " + (p.apellido || "") + " " + (p.dni || ""))
            .toLowerCase()
            .includes(term)
        )
          return;
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <strong>${escapeHtml(p.nombre)} ${escapeHtml(p.apellido)}</strong><br/>
            DNI: ${escapeHtml(p.dni)} — Edad: ${escapeHtml(p.edad)}<br/>
            Dx: ${escapeHtml(p.diagnostico)}
            <div style="margin-top:10px; display:flex; gap:8px; flex-wrap:wrap;">
              <button class="btn btn-primary" data-action="eval" data-id="${id}">Nueva evaluación</button>
              <button class="btn btn-secondary" data-action="qr" data-id="${id}">Generar QR</button>
              <button class="btn btn-secondary" data-action="detail" data-id="${id}">Ver ficha</button>
              <button class="btn btn-danger" data-action="delete" data-id="${id}">Eliminar</button>
            </div>`;
        listEl.appendChild(card);
      });
    }  
    // Buscar en input
    if (searchEl) {
      searchEl.addEventListener("input", () => {
        db.ref(`pacientes/${uid}`).get().then((snap) => renderPatients(snap.val()));
      });
    }
    // Escuchar cambios realtime
    db.ref(`pacientes/${uid}`).on("value", (snap) => {
      renderPatients(snap.val() || {});
      populatePatientFilter(uid);
    });
    // Delegación de botones dentro del listado
    listEl.addEventListener("click", async (ev) => {
      const btn = ev.target.closest("button");
      if (!btn) return;
      const action = btn.dataset.action;
      const patientId = btn.dataset.id;
      if (!action || !patientId) return;
      if (action === "delete") {
        if (!confirm("¿Eliminar paciente? Esta acción no se puede deshacer.")) return;
        await db.ref(`pacientes/${uid}/${patientId}`).remove();
        // eliminar evaluaciones asociadas opcional (mantener o borrar según diseño)
        // await db.ref(`evaluaciones/${uid}/${patientId}`).remove();
        return;
      }
      if (action === "detail") {
        await showPatientDetail(uid, patientId, detailEl);
        showView("patients"); // asegura vista abierta
        return;
      }
      if (action === "eval") {
        // abrir escalas y seleccionar escala por defecto (o mostrar selector)
        showView("scales");
        // por simplicidad abrir la primera escala definida
        const firstScaleId = Object.keys(SCALES_DATABASE)[0];
        showScaleApply(uid, patientId, firstScaleId);
        return;
      }
      if (action === "qr") {
        await generateQRForPatient(uid, patientId);
        return;
      }
    });
}
/* Mostrar ficha de paciente con gráfico, filtros de escalas y botón volver */
async function showPatientDetail(uid, patientId, container) {
  try {
    // Mostrar vista pacientes
    showView("patients");
    // Ocultar listado de pacientes
    const patientsList = document.getElementById("patientsList");
    if (patientsList) patientsList.classList.add("hidden");
    // Mostrar contenedor de detalle
    container.classList.remove("hidden");
    // Traer datos del paciente
    const snap = await db.ref(`pacientes/${uid}/${patientId}`).get();
    if (!snap.exists()) {
      alert("Paciente no encontrado");
      return;
    }
    const patient = snap.val();
    // Render base
    container.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
        <button id="btnBackToPatients" class="btn btn-secondary">← Volver</button>
        <h3 style="margin:0;">
          ${escapeHtml(patient.nombre)} ${escapeHtml(patient.apellido)}
        </h3>
      </div>
      <p>DNI: ${escapeHtml(patient.dni)} — Edad: ${escapeHtml(patient.edad)}</p>
      <p>Diagnóstico: ${escapeHtml(patient.diagnostico)}</p>
      <hr/>
      <!-- Filtros de escalas -->
      <div id="scaleFilters" style="margin-bottom:12px;"></div>
      <div style="width:100%; max-width:800px; height:280px; margin:auto;">
        <canvas id="evolutionChart"></canvas>
      </div>
      <div class="actions" style="margin-top:12px;">
        <button id="btnExportPatientPDF" class="btn btn-primary">
          Exportar PDF individual
        </button>
      </div>
    `;
    // Botón volver
    document.getElementById("btnBackToPatients").onclick = () => {
      container.classList.add("hidden");
      if (patientsList) patientsList.classList.remove("hidden");
    };
    // Traer evaluaciones
    const evalsSnap = await db.ref(`evaluaciones/${uid}/${patientId}`).get();
    const evalsObj = evalsSnap.val() || {};
    const evals = Object.entries(evalsObj)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    if (evals.length === 0) {
      document.getElementById("scaleFilters").innerHTML =
        "<em>No hay evaluaciones registradas</em>";
      return;
    }
    // Labels (fechas únicas)
    const labels = Array.from(
      new Set(evals.map(e => e.fecha?.slice(0, 10)))
    ).filter(Boolean);
    // Normalizar nombres de escalas (evita duplicados históricos)
    function normalizeScaleName(name) {
    if (!name) return "Escala desconocida";
    const n = name.toLowerCase();
    // INCAT (nombre viejo vs nuevo)
    if (n.includes("incat")) {
    return "INCAT – Escala de Discapacidad";
  }
  return name;
}
    // Agrupar por escala (normalizada)
    const byScale = {};
    evals.forEach(e => {
    const day = e.fecha?.slice(0, 10);
    if (!day) return;
    const scaleName = normalizeScaleName(e.escalaNombre);
    byScale[scaleName] = byScale[scaleName] || {};
    byScale[scaleName][day] = e.puntajeTotal;
});
    // Render filtros de escalas
    const scaleFiltersEl = document.getElementById("scaleFilters");
    scaleFiltersEl.innerHTML = "<strong>Escalas:</strong><br/>";
    Object.keys(byScale).forEach(scaleName => {
      const id = `chk_${scaleName.replace(/\s+/g, "_")}`;
      scaleFiltersEl.innerHTML += `
        <label style="margin-right:12px; display:inline-block;">
          <input type="checkbox" checked data-scale="${scaleName}" id="${id}">
          ${scaleName}
        </label>
      `;
    });
    // Función para construir datasets según selección
    function buildDatasets() {
      const checkedScales = Array.from(
        scaleFiltersEl.querySelectorAll("input:checked")
      ).map(i => i.dataset.scale);
      return checkedScales.map(name => ({
        label: name,
        data: labels.map(l => byScale[name][l] ?? null),
        borderColor: randomColor(),
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.25
      }));
    }
    // Crear gráfico
    const ctx = document.getElementById("evolutionChart").getContext("2d");
    if (window.evolutionChart instanceof Chart) {
      window.evolutionChart.destroy();
    }
    window.evolutionChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: buildDatasets()
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "nearest",
          intersect: false
        },
        plugins: {
          legend: { position: "bottom" },
          tooltip: { enabled: true }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
    // Actualizar gráfico al cambiar selección
    scaleFiltersEl.addEventListener("change", () => {
      window.evolutionChart.data.datasets = buildDatasets();
      window.evolutionChart.update();
    });
    // Exportar PDF
    document.getElementById("btnExportPatientPDF").onclick = () => {
      exportPatientReport(
        uid,
        patientId,
        patient,
        evals,
        document.getElementById("evolutionChart")
      );
    };
  } catch (err) {
    console.error(err);
    alert("Error cargando ficha: " + err.message);
  }
}
/* Escalas: render y aplicar (Calcular / Guardar) */
function initScales(uid) {
  const grid = document.getElementById("scalesGrid");
  const search = document.getElementById("scaleSearch");
  if (!grid || !search) return;
/* 1) RENDER DE ESCALAS + BUSCADOR SUPERIOR */
  function renderList(filterText = "") {
    grid.innerHTML = "";
    const filtro = filterText.trim().toLowerCase();
    Object.values(SCALES_DATABASE)
      .filter(s => s.name.toLowerCase().includes(filtro))
      .forEach((s) => {
        const card = document.createElement("div");
        card.className = "card";
        card.style.cursor = "default";
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong>${escapeHtml(s.name)}</strong>
            <span class="muted">${escapeHtml(s.category || "")}</span>
          </div>
          <p class="muted" style="margin-top:6px;">${escapeHtml(s.description || "")}</p>
          <div style="margin-top:12px; display:flex; gap:10px;">
            <button class="btn btn-primary btn-apply-scale" data-id="${escapeHtml(s.id)}">
              Aplicar
            </button>
            <button class="btn btn-secondary btn-qr-scale" data-id="${escapeHtml(s.id)}">
              Generar QR
            </button>
          </div>
        `;
        grid.appendChild(card);
      });
  }
  renderList();
  search.addEventListener("input", (e) => {
    renderList(e.target.value);
  });
/*2) CLICK EN APLICAR / GENERAR QR → SELECCIONAR PACIENTE */
  grid.addEventListener("click", async (ev) => {
    const btnApply = ev.target.closest(".btn-apply-scale");
    const btnQR = ev.target.closest(".btn-qr-scale");
    if (!btnApply && !btnQR) return;
    const scaleId = (btnApply || btnQR).dataset.id;
    // obtener pacientes
    const snap = await db.ref(`pacientes/${uid}`).get();
    const patients = snap.val() || {};
    const patientIds = Object.keys(patients);
    if (patientIds.length === 0) {
      alert("Creá un paciente antes de continuar.");
      return;
    }
    // referencias del modal
    const modal = document.getElementById("selectPatientModal");
    const input = document.getElementById("patientSearchInput");
    const results = document.getElementById("patientSearchResults");
    const btnCancel = document.getElementById("btnCancelSelectPatient");
    modal.classList.remove("hidden");
    input.value = "";
    results.innerHTML = "";
    // función para render de lista de pacientes
    function renderPatientsList(filter = "") {
      const f = filter.toLowerCase().trim();
      results.innerHTML = "";
      patientIds
        .filter(pid => {
          const p = patients[pid];
          const full = `${p.nombre} ${p.apellido} ${p.dni}`.toLowerCase();
          return full.includes(f);
        })
        .forEach(pid => {
          const p = patients[pid];
          const row = document.createElement("div");
          row.style.padding = "8px";
          row.style.cursor = "pointer";
          row.style.borderBottom = "1px solid #eee";
          row.innerHTML = `
            <strong>${escapeHtml(p.nombre)} ${escapeHtml(p.apellido)}</strong>
            <div class="muted" style="font-size:0.85rem;">DNI: ${escapeHtml(p.dni || "-")}</div>
          `;
          row.onclick = () => {
            modal.classList.add("hidden");
            if (btnApply) {
              // Aplicar → formulario interno
              showScaleApply(uid, pid, scaleId);
              showView("scales");
            }
            if (btnQR) {
              // Generar QR → QR directo
              generateQRForScale(uid, pid, scaleId);
            }
          };
          results.appendChild(row);
        });
      if (results.innerHTML.trim() === "") {
        results.innerHTML = `<div class="muted" style="padding:10px;">No se encontraron pacientes</div>`;
      }
    }
    // render inicial
    renderPatientsList("");
    // búsqueda en vivo
    input.addEventListener("input", () => {
      renderPatientsList(input.value);
    });
    // cerrar modal
    btnCancel.onclick = () => {
      modal.classList.add("hidden");
    };
  });
}
async function showScaleApply(uid, patientId, scaleId) {
  const modal = document.getElementById("scaleApplyModal");
  const body = document.getElementById("scaleApplyModalBody");
  const title = document.getElementById("scaleApplyTitle");
  const btnClose = document.getElementById("closeScaleApplyModal");
  if (!modal || !body || !title) return;
  const scale = SCALES_DATABASE[scaleId];
  if (!scale) {
    body.innerHTML = `<div class="muted">Escala no disponible</div>`;
    modal.classList.remove("hidden");
    return;
  }
  // Abrir modal
  modal.classList.remove("hidden");
  title.textContent = scale.name;
  // Render UI principal
  body.innerHTML = `
    <small class="muted">${escapeHtml(scale.category || "")}</small>
    <div id="scaleForm" class="scale-form" style="margin-top:16px;"></div>
    <div class="actions" style="margin-top:20px; display:flex; gap:12px; flex-wrap:wrap;">
      <button id="btnCalc" class="btn btn-secondary">Calcular</button>
      <button id="btnSaveEval" class="btn btn-primary" disabled>Guardar</button>
    </div>
    <div id="scaleResult" class="card" style="margin-top:16px;"></div>
  `;
  // Render formulario
  renderScaleFormClean(scale, document.getElementById("scaleForm"));
  // Variables temporales
  let lastScore = null;
  let lastInterpret = null;
  let lastAnswers = null;
  // Calcular
  document.getElementById("btnCalc").onclick = () => {
    const { score, interpretation, answers, breakdown } = calculateScale(scale);
    lastScore = score;
    lastInterpret = interpretation;
    lastAnswers = answers;
    const resEl = document.getElementById("scaleResult");
    let html = `<h4 style="margin-bottom:10px;">Resultado</h4>`;
    html += `<p><strong>Puntaje total:</strong> ${score}</p>`;
    // DESGLOSE ESPECIAL PARA SARA
    if (scale.id === "sara") {
      html += `<hr style="margin:12px 0;">`;
      html += `<h5>Desglose por ítem</h5>`;
      breakdown.forEach(item => {
        if (item.average !== undefined) {
          html += `
            <div style="margin-bottom:8px;">
              <strong>${item.text}</strong><br>
              Derecho: ${item.right} · Izquierdo: ${item.left}<br>
              <em>Promedio usado: ${item.average}</em>
            </div>
          `;
        } else {
          html += `
            <div style="margin-bottom:6px;">
              <strong>${item.text}:</strong> ${item.value}
            </div>
          `;
        }
      });
    }
    resEl.innerHTML = html;
    document.getElementById("btnSaveEval").disabled = false;
  };
  // Guardar
  document.getElementById("btnSaveEval").onclick = async () => {
    if (lastScore === null) {
      alert("Calculá el puntaje antes de guardar.");
      return;
    }
    try {
      const evalId = db.ref().push().key;
      const payload = {
        pacienteId: patientId,
        escalaId: scale.id,
        escalaNombre: scale.name,
        fecha: new Date().toISOString(),
        respuestas: lastAnswers,
        puntajeTotal: lastScore,
        interpretacion: lastInterpret
          ? lastInterpret.level || lastInterpret
          : null,
        tieneInterpretacion: !!lastInterpret,
        completadoPor: App.currentUser?.email || "medico",
        estado: "completada",
      };
      await db.ref(`evaluaciones/${uid}/${patientId}/${evalId}`).set(payload);
      // Cerrar modal automáticamente
      const modal = document.getElementById("scaleApplyModal");
      const body = document.getElementById("scaleApplyModalBody");
      if (modal) modal.classList.add("hidden");
      if (body) body.innerHTML = "";
      alert("Evaluación guardada correctamente.");
    } catch (err) {
      console.error(err);
      alert("Error al guardar evaluación: " + err.message);
    }
  };  
  // Cerrar modal
  btnClose.onclick = () => {
    modal.classList.add("hidden");
    body.innerHTML = "";
  };
}
/* Render limpio de preguntas y opciones */
function renderScaleFormClean(scale, container) {
  container.innerHTML = "";
  const saraBilateralIds = [
    "sara_finger_chase",
    "sara_nose_finger",
    "sara_fast_hand",
    "sara_heel_shin",
  ];
  scale.sections.forEach((sec, sIndex) => {
    const fieldset = document.createElement("fieldset");
    fieldset.style.border = "1px solid #e2e8f0";
    fieldset.style.borderRadius = "8px";
    fieldset.style.padding = "16px";
    fieldset.style.marginTop = "16px";
    fieldset.style.background = "#fff";
    const legend = document.createElement("legend");
    legend.textContent = sec.title || `Sección ${sIndex + 1}`;
    legend.style.fontWeight = "700";
    legend.style.color = "#1e3a5f";
    legend.style.padding = "0 8px";
    legend.style.fontSize = "1rem";
    fieldset.appendChild(legend);
    sec.questions.forEach((q, qIndex) => {
      const row = document.createElement("div");
      row.style.marginTop = "16px";
      const label = document.createElement("label");
      label.textContent = `${qIndex + 1}. ${q.text}`;
      label.style.display = "block";
      label.style.fontWeight = "600";
      label.style.marginBottom = "12px";
      label.style.fontSize = "0.95rem";
      row.appendChild(label);
      // SARA bilateral
      if (scale.id === "sara" && saraBilateralIds.includes(q.id)) {
        const grid = document.createElement("div");
        grid.style.display = "grid";
        grid.style.gridTemplateColumns = "1fr 1fr";
        grid.style.gap = "16px";
        ["R", "L"].forEach((side) => {
          const col = document.createElement("div");
          const sideTitle = document.createElement("div");
          sideTitle.textContent = side === "R" ? "Derecho" : "Izquierdo";
          sideTitle.style.fontWeight = "700";
          sideTitle.style.marginBottom = "8px";
          sideTitle.style.color = "#1e3a5f";
          col.appendChild(sideTitle);
          const opts = document.createElement("div");
          opts.style.display = "grid";
          opts.style.gridTemplateColumns = "repeat(auto-fit, minmax(140px, 1fr))";
          opts.style.gap = "10px";
          q.options.forEach((opt) => {
            const id = `${q.id}_${side}_${opt.value}_${Math.random()
              .toString(36)
              .slice(2, 6)}`;
            const wrap = document.createElement("label");
            wrap.style.display = "flex";
            wrap.style.flexDirection = "column";
            wrap.style.alignItems = "center";
            wrap.style.padding = "12px";
            wrap.style.border = "2px solid #e2e8f0";
            wrap.style.borderRadius = "8px";
            wrap.style.cursor = "pointer";
            wrap.style.backgroundColor = "white";
            wrap.style.textAlign = "center";
            const input = document.createElement("input");
            input.type = "radio";
            input.name = `${q.id}_${side}`;
            input.value = opt.value;
            input.id = id;
            input.style.marginBottom = "6px";
            wrap.appendChild(input);
            const span = document.createElement("span");
            span.textContent = opt.label;
            span.style.fontSize = "0.8rem";
            span.style.lineHeight = "1.4";
            span.style.color = "#374151";
            wrap.appendChild(span);
            input.addEventListener("change", () => {
              document
                .querySelectorAll(`input[name="${q.id}_${side}"]`)
                .forEach((r) => {
                  const p = r.closest("label");
                  if (!p) return;
                  if (r.checked) {
                    p.style.borderColor = "#1e3a5f";
                    p.style.backgroundColor = "#f0f9ff";
                  } else {
                    p.style.borderColor = "#e2e8f0";
                    p.style.backgroundColor = "white";
                  }
                });
            });
            opts.appendChild(wrap);
          });
          col.appendChild(opts);
          grid.appendChild(col);
        });
        row.appendChild(grid);
        fieldset.appendChild(row);
        return;
      }
      // Todas las demás preguntas
      const opts = document.createElement("div");
      opts.style.display = "grid";
      opts.style.gridTemplateColumns = "repeat(auto-fit, minmax(180px, 1fr))";
      opts.style.gap = "12px";
      q.options.forEach((opt) => {
        const id = `${q.id}_${opt.value}_${Math.random()
          .toString(36)
          .slice(2, 6)}`;
        const wrap = document.createElement("label");
        wrap.style.display = "flex";
        wrap.style.flexDirection = "column";
        wrap.style.alignItems = "center";
        wrap.style.padding = "16px 12px";
        wrap.style.border = "2px solid #e2e8f0";
        wrap.style.borderRadius = "8px";
        wrap.style.cursor = "pointer";
        wrap.style.backgroundColor = "white";
        wrap.style.textAlign = "center";
        const input = document.createElement("input");
        input.type = "radio";
        input.name = q.id;
        input.value = opt.value;
        input.id = id;
        input.style.marginBottom = "8px";
        wrap.appendChild(input);
        const span = document.createElement("span");
        span.textContent = opt.label;
        span.style.fontSize = "0.85rem";
        span.style.color = "#374151";
        wrap.appendChild(span);
        input.addEventListener("change", () => {
          document.querySelectorAll(`input[name="${q.id}"]`).forEach((r) => {
            const p = r.closest("label");
            if (!p) return;
            if (r.checked) {
              p.style.borderColor = "#1e3a5f";
              p.style.backgroundColor = "#f0f9ff";
            } else {
              p.style.borderColor = "#e2e8f0";
              p.style.backgroundColor = "white";
            }
          });
        });
        opts.appendChild(wrap);
      });
      row.appendChild(opts);
      fieldset.appendChild(row);
    });
    container.appendChild(fieldset);
  });
}
/* Calcula puntaje, devuelve respuestas, interpretación y desglose (SARA) */
function calculateScale(scale) {
  let score = 0;
  const answers = {};
  const breakdown = [];
  scale.sections.forEach((sec) => {
    sec.questions.forEach((q) => {
      // SARA BILATERAL (items 5–8)
      if (
        scale.id === "sara" &&
        ["sara_finger_chase", "sara_nose_finger", "sara_fast_hand", "sara_heel_shin"].includes(q.id)
      ) {
        const right = document.querySelector(`input[name="${q.id}_R"]:checked`);
        const left = document.querySelector(`input[name="${q.id}_L"]:checked`);
        const valR = right ? Number(right.value) : 0;
        const valL = left ? Number(left.value) : 0;
        const avg = (valR + valL) / 2;
        answers[`${q.id}_R`] = valR;
        answers[`${q.id}_L`] = valL;
        score += avg;
        breakdown.push({
          id: q.id,
          text: q.text,
          right: valR,
          left: valL,
          average: avg,
        });
      } else {
        // Todas las demás escalas + ítems 1–4 SARA
        const sel = document.querySelector(`input[name="${q.id}"]:checked`);
        const val = sel ? Number(sel.value) : 0;
        answers[q.id] = val;
        score += val;
        breakdown.push({
          id: q.id,
          text: q.text,
          value: val,
        });
      }
    });
  });
  let interpretation = null;
  if (scale.hasInterpretation && typeof scale.interpretation === "function") {
    interpretation = scale.interpretation(score);
  }
  return { score, interpretation, answers, breakdown };
}
/* REPORTES: con filtros funcionales en tiempo real */
function initReports(uid) {
    const tbody = document.getElementById("reportsTableBody");
    const searchInput = document.getElementById("filterSearch");
    const filterPatient = document.getElementById("filterPatient");
    const filterScale = document.getElementById("filterScale");
    const reportCount = document.getElementById("reportCount");
    const patientsRef = db.ref(`pacientes/${uid}`);
    const evalsRef = db.ref(`evaluaciones/${uid}`);
    if (!tbody) return;
    // Variable global para almacenar todas las evaluaciones
    let allEvaluations = [];
    // Llenar filtros al cargar
    populatePatientFilter(uid);
    populateScaleFilter();
    // Función para filtrar y renderizar
    function filterAndRender() {
      const searchTerm = (searchInput?.value || "").toLowerCase().trim();
      const selectedPatient = filterPatient?.value || "";
      const selectedScale = filterScale?.value || "";
      const filtered = allEvaluations.filter(item => {
        // Filtro por búsqueda de texto (nombre o DNI)
        const matchSearch = !searchTerm || 
          item.pacienteNombre.toLowerCase().includes(searchTerm) ||
          (item.pacienteDni || "").toLowerCase().includes(searchTerm);
        // Filtro por paciente seleccionado
        const matchPatient = !selectedPatient || item.patientId === selectedPatient;
        // Filtro por escala seleccionada
        const matchScale = !selectedScale || item.escalaId === selectedScale;  
        return matchSearch && matchPatient && matchScale;
      });
      // Actualizar contador
      if (reportCount) {
        const texto = filtered.length === 1 
          ? "1 evaluación encontrada"
          : `${filtered.length} evaluaciones encontradas`;
        reportCount.textContent = texto;
      }
      // Renderizar tabla
      tbody.innerHTML = "";
      if (filtered.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align:center; color:#94a3b8; padding:2rem;">
              ${allEvaluations.length === 0 
                ? "No hay evaluaciones registradas" 
                : "No se encontraron resultados con los filtros aplicados"}
            </td>
          </tr>`;
        return;
      }
      filtered.forEach((item) => {
        const tr = document.createElement("tr");
        const fechaFormateada = item.fecha 
          ? new Date(item.fecha).toLocaleDateString('es-AR')
          : "-";
        tr.innerHTML = `
          <td style="font-weight:300;">${fechaFormateada}</td>
          <td>
            <div style="font-weight:400;">${escapeHtml(item.pacienteNombre)}</div>
            ${item.pacienteDni ? `<div style="font-size:0.85rem; color:#94a3b8;">DNI: ${escapeHtml(item.pacienteDni)}</div>` : ''}
          </td>
          <td style="font-weight:300;">${escapeHtml(item.escalaNombre)}</td>
          <td style="font-weight:400; color:#1e3a5f;">${escapeHtml(String(item.puntaje))}</td>
          <td>
            <div style="display:flex; gap:8px; justify-content:flex-end;">
              <button 
                class="btn-view-report" 
                data-pid="${item.patientId}" 
                title="Ver ficha del paciente"
                style="background:transparent; border:1px solid #e2e8f0; padding:6px 10px; border-radius:2px; cursor:pointer; display:flex; align-items:center; gap:4px; transition:all 0.2s;"
                onmouseover="this.style.background='#f5f7fa'; this.style.borderColor='#1e3a5f'"
                onmouseout="this.style.background='transparent'; this.style.borderColor='#e2e8f0'">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7z" stroke="#1e3a5f" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="#1e3a5f" stroke-width="1.5"/>
                </svg>
              </button>
              <button 
                class="btn-pdf-report btn-primary" 
                data-pid="${item.patientId}" 
                data-eid="${item.evalId}"
                title="Exportar PDF individual"
                style="padding:6px 12px; font-size:0.85rem;">
                PDF
              </button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }
    // Event listeners para filtros en tiempo real
    if (searchInput) {
      searchInput.addEventListener("input", filterAndRender);
    }
    if (filterPatient) {
      filterPatient.addEventListener("change", filterAndRender);
    }
    if (filterScale) {
      filterScale.addEventListener("change", filterAndRender);
    }
    // Cargar evaluaciones desde Firebase
    evalsRef.on("value", async (snap) => {
      try {
        const data = snap.val();
        if (!data) {
          allEvaluations = [];
          filterAndRender();
          return;
        }
        // Obtener pacientes para mapear nombres y DNIs
        const patientsSnap = await patientsRef.get();
        const patientsMap = patientsSnap.exists() ? patientsSnap.val() : {};
        // Crear array con todas las evaluaciones
        allEvaluations = [];
        Object.entries(data).forEach(([patientId, evals]) => {
          Object.entries(evals || {}).forEach(([evalId, e]) => {
            const patient = patientsMap[patientId] || {};
            const nombreCompleto = `${patient.nombre || ""} ${patient.apellido || ""}`.trim();
            allEvaluations.push({
              evalId,
              patientId,
              fecha: e.fecha || null,
              pacienteNombre: nombreCompleto || `Paciente ${patientId.slice(0, 8)}`,
              pacienteDni: patient.dni || null,
              escalaNombre: e.escalaNombre || e.escalaId || "-",
              escalaId: e.escalaId || null,
              puntaje: e.puntajeTotal ?? "-",
              interpretacion: e.interpretacion || "-"
            });
          });
        });  
        // Ordenar por fecha descendente
        allEvaluations.sort((a, b) => {
          const dateA = a.fecha ? new Date(a.fecha).getTime() : 0;
          const dateB = b.fecha ? new Date(b.fecha).getTime() : 0;
          return dateB - dateA;
        });
        // Renderizar con filtros aplicados
        filterAndRender();
      } catch (error) {
        console.error("Error en initReports:", error);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#ef4444; padding:2rem;">Error al cargar reportes</td></tr>';
      }
    });
    // Event delegation para botones de acción
    tbody.addEventListener("click", async (ev) => {
      const btnView = ev.target.closest(".btn-view-report");
      const btnPdf = ev.target.closest(".btn-pdf-report");
      // Ver ficha del paciente
      if (btnView) {
        const pid = btnView.dataset.pid;
        showView("patients");
        document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
        const navPatients = document.querySelector('.nav-item[data-view="patients"]');
        if (navPatients) navPatients.classList.add("active");
        const detailEl = document.getElementById("patientDetail");
        if (detailEl) {
            await showPatientDetail(uid, pid, detailEl);
            setTimeout(() => {
            detailEl.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
        }
        return;
        }
      // Exportar PDF individual
      if (btnPdf) {
        const pid = btnPdf.dataset.pid;
        const eid = btnPdf.dataset.eid;
        try {
          const patientSnap = await patientsRef.child(pid).get();
          const patient = patientSnap.exists() 
            ? patientSnap.val() 
            : { nombre: "", apellido: "" };
          const evalSnap = await db.ref(`evaluaciones/${uid}/${pid}/${eid}`).get();
          const evalData = evalSnap.exists() 
            ? [{ id: eid, ...evalSnap.val() }] 
            : [];
          await exportPatientReport(
            uid, 
            pid, 
            patient, 
            evalData, 
            document.getElementById("evolutionChart")
          );
        } catch (err) {
          console.error("Error exportando PDF:", err);
          alert("No se pudo exportar el PDF.");
        }
        return;
      }
    });
    // Exportar PDF global (con filtros aplicados)
    const btnExport = document.getElementById("btnExportSelected");
    if (btnExport) {
      btnExport.addEventListener("click", async () => {
        try {
          // Usar las evaluaciones filtradas actuales
          const searchTerm = (searchInput?.value || "").toLowerCase().trim();
          const selectedPatient = filterPatient?.value || "";
          const selectedScale = filterScale?.value || "";
          const filtered = allEvaluations.filter(item => {
            const matchSearch = !searchTerm || 
              item.pacienteNombre.toLowerCase().includes(searchTerm) ||
              (item.pacienteDni || "").toLowerCase().includes(searchTerm);
            const matchPatient = !selectedPatient || item.patientId === selectedPatient;
            const matchScale = !selectedScale || item.escalaId === selectedScale;
            return matchSearch && matchPatient && matchScale;
          });
          if (filtered.length === 0) {
            alert("No hay evaluaciones para exportar con los filtros aplicados");
            return;
          }
          const rows = filtered.map(item => [
            item.fecha ? new Date(item.fecha).toLocaleDateString('es-AR') : "-",
            item.pacienteNombre,
            item.escalaNombre,
            String(item.puntaje),
            item.interpretacion
          ]);
          // Generar PDF
          const { jsPDF } = window.jspdf;
          const doc = new jsPDF();
          // Header del médico
          const medicoSnap = await db.ref(`medicos/${uid}`).get();
          const medico = medicoSnap.exists() ? medicoSnap.val() : {};
          const medicoNombre = medico.nombre 
            ? `Dr/a ${medico.nombre}`
            : App.currentUser?.email || "Médico";
          doc.setFontSize(16);
          doc.setFont(undefined, 'bold');
          doc.text("Reporte de Evaluaciones", 14, 20);
          doc.setFontSize(10);
          doc.setFont(undefined, 'normal');
          doc.text(`Médico: ${medicoNombre}`, 14, 28);
          doc.text(`Generado: ${new Date().toLocaleString('es-AR')}`, 14, 34);
          doc.text(`Evaluaciones: ${filtered.length}`, 14, 40);
          // Información de filtros aplicados
          let filterInfo = [];
          if (searchTerm) filterInfo.push(`Búsqueda: "${searchTerm}"`);
          if (selectedPatient) {
            const pName = filterPatient.options[filterPatient.selectedIndex].text;
            filterInfo.push(`Paciente: ${pName}`);
          }
          if (selectedScale) {
            const sName = filterScale.options[filterScale.selectedIndex].text;
            filterInfo.push(`Escala: ${sName}`);
          }
          if (filterInfo.length > 0) {
            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.text(`Filtros: ${filterInfo.join(" | ")}`, 14, 46);
          }
          // Tabla
          doc.autoTable({
            startY: filterInfo.length > 0 ? 52 : 46,
            head: [["Fecha", "Paciente", "Escala", "Puntaje", "Interpretación"]],
            body: rows,
            styles: { 
              fontSize: 9,
              cellPadding: 3
            },
            headStyles: {
              fillColor: [30, 58, 95],
              textColor: 255,
              fontStyle: 'bold'
            },
            alternateRowStyles: {
              fillColor: [250, 251, 252]
            }
          });
          const fileName = `reporte-evaluaciones-${new Date().toISOString().slice(0,10)}.pdf`;
          doc.save(fileName);
        } catch (err) {
          console.error("Error exportando reporte:", err);
          alert("Error al exportar: " + err.message);
        }
      });
    }
}
/* PERFIL: actualizar datos + reset contraseña + header "Dr/a Nombre" */
function initProfile(uid) {
    const ref = db.ref(`medicos/${uid}`);  
    // rellenar email desde auth
    auth.onAuthStateChanged((user) => {
      if (!user) return;
      const emailEl = document.getElementById("medEmail");
      if (emailEl) emailEl.value = user.email;
    });
    // escuchar datos del perfil médico y mostrar
    ref.on("value", (snap) => {
      const p = snap.val() || {};
      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val || "";
      };
      setVal("medNombre", p.nombre || "");
      setVal("medMatricula", p.matricula || "");
      setVal("medEspecialidad", p.especialidad || "");
      setVal("medHospital", p.hospital || "");
      // actualizar header
      const headerName = p.nombre ? `Dr/a ${p.nombre}` : auth.currentUser?.email || "Dr.";
      const headerEl = document.getElementById("doctorName");
      if (headerEl) headerEl.textContent = headerName;
    });
    // guardar perfil
    const btnSave = document.getElementById("btnSaveProfile");
    if (btnSave) {
      btnSave.addEventListener("click", async () => {
        try {
          const payload = {
            nombre: document.getElementById("medNombre").value.trim(),
            email: document.getElementById("medEmail").value.trim(),
            matricula: document.getElementById("medMatricula").value.trim(),
            especialidad: document.getElementById("medEspecialidad").value.trim(),
            hospital: document.getElementById("medHospital").value.trim(),
            fechaActualizacion: new Date().toISOString(),
          };
          await ref.set(payload);
          alert("Perfil actualizado correctamente.");
        } catch (err) {
          console.error(err);
          alert("Error guardando perfil: " + err.message);
        }
      });
    }
    // reset contraseña
    const btnReset = document.getElementById("btnChangePassword");
    if (btnReset) {
      btnReset.addEventListener("click", async () => {
        try {
          const email = document.getElementById("medEmail").value;
          if (!email) {
            alert("Email no disponible");
            return;
          }
          await auth.sendPasswordResetEmail(email);
          alert("Se envió un email para restablecer la contraseña.");
        } catch (err) {
          console.error(err);
          alert("Error al enviar email: " + err.message);
        }
      });
    }
}
/* Helpers y utilidades */
function randomColor() {
    const colors = [
      "#2c5f7c",
      "#4a90b5",
      "#1a3d52",
      "#e8967d",
      "#10b981",
      "#ef4444",
      "#f59e0b",
      "#7c3aed",
      "#059669",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}
/* Notificaciones Dashboard*/
function initInternalNotifications(uid) {
  const container = document.getElementById("dashboardNotifications");
  if (!container) return;

  const ref = db.ref(`notificaciones/${uid}`);

  // Escuchar SOLO nuevas notificaciones
  ref.limitToLast(1).on("child_added", (snap) => {
    if (!notificationsReady) return;

    const n = snap.val();
    if (!n) return;

    renderDashboardNotification(n, snap.key);
  });

  // Marcar cuando terminó la carga inicial
  ref.once("value", () => {
    notificationsReady = true;
    console.log("Notificaciones listas (historial ignorado)");
  });
}
function renderDashboardNotification(n, notifId) {
  const container = document.getElementById("dashboardNotifications");
  if (!container) return;

  // Eliminar mensaje "no hay notificaciones"
  const empty = container.querySelector(".no-notifications");
  if (empty) empty.remove();

  const div = document.createElement("div");
  div.className = "notification card";
  div.style.cursor = "pointer";

  div.innerHTML = `
    <strong>📋 Nueva evaluación</strong><br>
    ${n.pacienteNombre} completó la escala <b>${n.escalaNombre}</b>
    <div style="font-size:0.75rem;color:#64748b;margin-top:4px;">
      ${new Date(n.fecha).toLocaleString("es-AR")}
    </div>
  `;

  div.onclick = () => {
    showView("patients");
    // más adelante podés navegar directo a la ficha
  };

  container.prepend(div);
}
function showDashboardNotification(text, patientId) {
  const container = document.getElementById("dashboardNotifications");
  if (!container) return;
  // Si existe el mensaje "no hay notificaciones", lo sacamos
  const empty = container.querySelector(".notif-empty");
  if (empty) empty.remove();
  const div = document.createElement("div");
  div.className = "card dashboard-notification";
  div.style.borderLeft = "4px solid #1e3a5f";
  div.style.padding = "12px";
  div.style.marginBottom = "8px";
  div.style.cursor = "pointer";
  div.style.transition = "background 0.2s";
  div.innerHTML = `
    <strong>Nueva evaluación</strong>
    <div style="font-size:0.9rem;color:#475569;margin-top:4px;">
      ${escapeHtml(text)}
    </div>
    <div style="font-size:0.75rem;color:#94a3b8;margin-top:6px;">
      Click para ver ficha del paciente
    </div>
  `;
  // CLICK → ficha del paciente
  div.onclick = async () => {
    showView("patients");
    document.querySelectorAll(".nav-item")
      .forEach(n => n.classList.remove("active"));
    document
      .querySelector('.nav-item[data-view="patients"]')
      ?.classList.add("active");
    const detail = document.getElementById("patientDetail");
    if (detail && patientId) {
      await showPatientDetail(App.currentUser.uid, patientId, detail);
      detail.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  container.prepend(div);
}
// llena select de pacientes en sección reportes //
async function populatePatientFilter(uid) {
    const sel = document.getElementById("filterPatient");
    if (!sel) return;
    sel.innerHTML = '<option value="">Todos</option>';
    const snap = await db.ref(`pacientes/${uid}`).get();
    const data = snap.val() || {};
    Object.entries(data).forEach(([id, p]) => {
      const opt = document.createElement("option");
      opt.value = id;
      opt.textContent = `${p.nombre || ""} ${p.apellido || ""} (${p.dni || ""})`;
      sel.appendChild(opt);
    });
}
// llena select de escalas en reportes //
function populateScaleFilter() {
    const sel = document.getElementById("filterScale");
    if (!sel) return;
    sel.innerHTML = '<option value="">Todas</option>';
    Object.values(SCALES_DATABASE).forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = s.name;
      sel.appendChild(opt);
    });
}
// Export/Interoperabilidad con pdf-generator.js //
if (typeof exportPatientReport !== "function") {
    // fallback simple (no imagen del chart)
    window.exportPatientReport = async function (uid, patientId, patient, evals, chartCanvas) {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text("Informe de evaluación - NeuroScale", 14, 18);
      doc.setFontSize(10);
      doc.text(`Médico: ${auth.currentUser?.email || "-"}`, 14, 26);
      doc.text(`Paciente: ${patient.nombre || ""} ${patient.apellido || ""}`, 14, 34);
      doc.text(`DNI: ${patient.dni || ""}`, 14, 40);
      doc.text(`Edad: ${patient.edad || ""}`, 14, 46);
      doc.text(`Diagnóstico: ${patient.diagnostico || ""}`, 14, 52);  
      const rows = (evals || []).map((e) => [
        e.fecha ? e.fecha.slice(0,10) : "-",
        e.escalaNombre,
        String(e.puntajeTotal ?? "-"),
        e.interpretacion || "-",
      ]);
      doc.autoTable({
        startY: 62,
        head: [["Fecha", "Escala", "Puntaje", "Interpretación"]],
        body: rows,
      });
      doc.save(
        `reporte-${patient.apellido || "sinapellido"}-${patient.nombre || "sinnombre"}.pdf`
      );
    };
}
/* Funciones QR - funcionan tanto en localhost como en prod */
// Función auxiliar para obtener la URL base correcta
function getBaseURL() {
  // En desarrollo (localhost): usa la URL actual
  // En producción (Netlify): usa la URL del dominio
  const origin = window.location.origin;
  const pathname = window.location.pathname;  
  // Si estás en /index.html, quitar el archivo
  if (pathname.endsWith('index.html')) {
    return origin + pathname.replace('index.html', '');
  }
  // Si estás en /, usar tal cual
  if (pathname.endsWith('/')) {
    return origin + pathname;
  }
  // Si estás en /carpeta/archivo.html, quedarse con /carpeta/
  return origin + pathname.substring(0, pathname.lastIndexOf('/') + 1);
}
/* QR: generación con URL automática */
async function generateQRForPatient(uid, patientId) {
  try {
    const scaleId = Object.keys(SCALES_DATABASE)[0] || "incat";
    const evalId = db.ref().push().key;
    const qrId = db.ref().push().key;
    // Guardar datos del QR en Firebase
    await db.ref(`qrCodes/${qrId}`).set({
      medicoId: uid,
      pacienteId: patientId,
      escalaId: scaleId,
      evaluacionId: evalId,
      estado: "activo",
      fechaCreacion: new Date().toISOString(),
      fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
    // URL automática
    const baseURL = getBaseURL();
    const url = `${baseURL}patient-eval.html?qr=${encodeURIComponent(qrId)}`;
    // Modal
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.style.zIndex = 9999;
    modal.innerHTML = `
      <div class="modal-content">
        <h3>QR para paciente</h3>
        <p style="font-size:0.9rem;color:#64748b;margin-bottom:12px;">
          Escaneá este código o compartí el link con el paciente
        </p>
        <div id="qrBox_${qrId}"
          style="display:flex;justify-content:center;padding:16px;background:#f8f9fa;border-radius:8px;margin:12px 0;">
        </div>
        <details style="margin-top:12px;">
          <summary style="cursor:pointer;color:#1e3a5f;font-size:0.85rem;">
            Ver URL completa
          </summary>
          <p style="font-size:11px;color:#94a3b8;word-break:break-all;
                    background:#f8f9fa;padding:8px;border-radius:4px;
                    margin-top:8px;font-family:monospace;">
            ${escapeHtml(url)}
          </p>
        </details>
        <div class="modal-actions" style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-primary" id="shareQr_${qrId}">
            Compartir link
          </button>
          <button class="btn btn-secondary" id="copyQr_${qrId}">
            Copiar link
          </button>
          <button class="btn btn-secondary" id="closeQr_${qrId}">
            Cerrar
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    // Render QR
    new QRCode(document.getElementById(`qrBox_${qrId}`), {
      text: url,
      width: 200,
      height: 200,
      colorDark: "#1e3a5f",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
    // Compartir (WhatsApp / Mail en mobile)
    document.getElementById(`shareQr_${qrId}`).onclick = async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: "Evaluación NeuroScale",
            text: "Completá esta escala desde tu celular",
            url: url
          });
        } catch (_) {}
      } else {
        alert("Este navegador no permite compartir directamente. Podés copiar el link.");
      }
    };
    // Copiar link
    document.getElementById(`copyQr_${qrId}`).onclick = async () => {
      await navigator.clipboard.writeText(url);
      const btn = document.getElementById(`copyQr_${qrId}`);
      btn.textContent = "Link copiado!";
      setTimeout(() => (btn.textContent = "Copiar link"), 2000);
    };
    // Cerrar
    document.getElementById(`closeQr_${qrId}`).onclick = () =>
      document.body.removeChild(modal);
  } catch (err) {
    console.error("Error generando QR:", err);
    alert("Error generando QR: " + err.message);
  }
}
/* QR: generación con escala específica */
async function generateQRForScale(uid, patientId, scaleId) {
  try {
    const evalId = db.ref().push().key;
    const qrId = db.ref().push().key;
    await db.ref(`qrCodes/${qrId}`).set({
      medicoId: uid,
      pacienteId: patientId,
      escalaId: scaleId,
      evaluacionId: evalId,
      estado: "activo",
      fechaCreacion: new Date().toISOString(),
      fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
    const baseURL = getBaseURL();
    const url = `${baseURL}patient-eval.html?qr=${encodeURIComponent(qrId)}`;
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.style.zIndex = 9999;
    modal.innerHTML = `
      <div class="modal-content">
        <h3>QR para esta escala</h3>
        <p style="font-size:0.9rem;color:#64748b;margin-bottom:12px;">
          El paciente podrá completar esta escala desde su celular
        </p>
        <div id="qrBox_${qrId}"
          style="display:flex;justify-content:center;padding:16px;background:#f8f9fa;border-radius:8px;margin:12px 0;">
        </div>
        <details>
          <summary style="cursor:pointer;color:#1e3a5f;font-size:0.85rem;">
            Ver URL completa
          </summary>
          <p style="font-size:11px;color:#94a3b8;word-break:break-all;
                    background:#f8f9fa;padding:8px;border-radius:4px;
                    margin-top:8px;font-family:monospace;">
            ${escapeHtml(url)}
          </p>
        </details>
        <div class="modal-actions" style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-primary" id="shareQr_${qrId}">
            Compartir link
          </button>
          <button class="btn btn-secondary" id="copyQr_${qrId}">
            Copiar link
          </button>
          <button class="btn btn-secondary" id="closeQr_${qrId}">
            Cerrar
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    new QRCode(document.getElementById(`qrBox_${qrId}`), {
      text: url,
      width: 200,
      height: 200,
      colorDark: "#1e3a5f",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
    document.getElementById(`shareQr_${qrId}`).onclick = async () => {
      if (navigator.share) {
        await navigator.share({
          title: "Evaluación NeuroScale",
          text: "Completá esta escala desde tu celular",
          url: url
        });
      } else {
        alert("Podés copiar el link para compartirlo.");
      }
    };
    document.getElementById(`copyQr_${qrId}`).onclick = async () => {
      await navigator.clipboard.writeText(url);
      const btn = document.getElementById(`copyQr_${qrId}`);
      btn.textContent = "Link copiado!";
      setTimeout(() => (btn.textContent = "Copiar link"), 2000);
    };
    document.getElementById(`closeQr_${qrId}`).onclick = () =>
      document.body.removeChild(modal);
  } catch (err) {
    console.error("Error generando QR:", err);
    alert("Error generando QR: " + err.message);
  }
}
/* TESTING: Descomentar para ver URLs generadas */
// console.log('URL base detectada:', getBaseURL());
// console.log('Hostname:', window.location.hostname);
// console.log('Entorno:', window.location.hostname === 'localhost' ? 'DESARROLLO' : 'PRODUCCIÓN');
