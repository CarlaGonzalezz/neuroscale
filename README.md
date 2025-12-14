# NeuroScale

Sistema web profesional para automatización de escalas neurológicas.

---

## Descripción

**NeuroScale** es una aplicación web diseñada para neurólogos que permite gestionar pacientes, aplicar escalas neurológicas estandarizadas, registrar evaluaciones y visualizar la evolución clínica en el tiempo.

### Funcionalidades principales:
- Gestión completa de pacientes
- Aplicación de escalas neurológicas oficiales
- Registro y seguimiento de evaluaciones
- Visualización de evolución temporal con gráficos
- Generación de reportes en PDF
- Sistema de evaluación remota vía código QR
- Notificaciones por email al médico

---

## Tecnologías

- **Frontend:** HTML5, CSS3, JavaScript (vanilla)
- **Backend:** Firebase (Authentication + Realtime Database)
- **Librerías:**
  - Chart.js (gráficos)
  - jsPDF (generación de PDFs)
  - QRCode.js (códigos QR)

---

## Diseño

- Interfaz limpia y profesional tipo dashboard médico
- Responsive (desktop, tablet, móvil)
- Paleta de colores institucionales (azul médico)
- Diseño accesible y optimizado para uso clínico

---

## Estado del proyecto

**En desarrollo activo**

### Implementado:
-  Sistema de autenticación (login/registro)
-  Dashboard principal
-  Sistema de gestión de pacientes
-  Aplicación de escalas neurológicas
-  Historial de evaluaciones

### En progreso:
-  Notificaciones por email

### Próximamente:
-  Más escalas neurológicas oficiales
-  Exportación de datos

---

## Instalación

1. Clonar el repositorio
```bash
git clone https://github.com/CarlaGonzalezz/neuroscale.git
```

2. Configurar Firebase:
   - Crear proyecto en [Firebase Console](https://console.firebase.google.com)
   - Habilitar Authentication (Email/Password)
   - Habilitar Realtime Database
   - Copiar credenciales en `firebase-config.js`

3. Abrir `index.html` en un servidor local

---

## Uso

1. Registrarse como médico
2. Completar datos del perfil (matrícula, especialidad, hospital)
3. Agregar pacientes
4. Aplicar escalas neurológicas
5. Ver evolución y generar reportes

---

## Seguridad y Privacidad

- Datos de pacientes protegidos con Firebase Security Rules
- Cada médico solo accede a sus propios pacientes
- Cumplimiento de estándares de privacidad médica

---

## Licencia

Este proyecto es de uso privado y fue desarrollado para fines médicos profesionales.

---

## Desarrolladora

**Carla González**

Proyecto desarrollado como herramienta de apoyo para la práctica neurológica.

---

## Contacto

Para consultas sobre el proyecto: [miicatutti95@gmail.com]

---

**NeuroScale** © 2025 - Desarrollado por Carla González