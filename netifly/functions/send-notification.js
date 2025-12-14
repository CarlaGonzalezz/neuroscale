// netlify/functions/send-notification.js
// Función serverless para enviar emails con Resend
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'NeuroScale <onboarding@resend.dev>';
exports.handler = async (event, context) => {
  // Solo permitir POST
if (event.httpMethod !== 'POST') {
    return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Método no permitido' })
    };
}
  // CORS headers
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
};
  // Handle preflight
if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
}
try {
    // Parse del body
    const data = JSON.parse(event.body);
    const { medicoEmail, medicoNombre, pacienteNombre, escalaNombre, dashboardURL } = data;
    // Validaciones
    if (!medicoEmail || !pacienteNombre || !escalaNombre) {
        return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
            error: 'Faltan datos requeridos',
            required: ['medicoEmail', 'pacienteNombre', 'escalaNombre']
        })
        };
    }
    if (!RESEND_API_KEY) {
        console.error('RESEND_API_KEY no configurada');
        return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Configuración del servidor incompleta' })
        };
    }
    // Preparar email
    const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            }
            .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header {
            background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
            }
            .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            }
            .content {
            padding: 30px 20px;
            }
            .alert-box {
            background: #e8f4f8;
            border-left: 4px solid #1e3a5f;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            }
            .info-row {
            display: flex;
            padding: 12px 0;
            border-bottom: 1px solid #eee;
            }
            .info-label {
            font-weight: 600;
            color: #1e3a5f;
            min-width: 120px;
            }
            .info-value {
            color: #555;
            }
            .button {
            display: inline-block;
            background: #1e3a5f;
            color: white !important;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
            }
            .button:hover {
            background: #2d5a8e;
            }
            .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            }
            @media only screen and (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            }
        </style>
        </head>
        <body>
        <div class="container">
            <div class="header">
            <h1>Nueva Evaluación Completada</h1>
            </div>
            <div class="content">
            <p>Hola ${medicoNombre || 'Dr/Dra'},</p>
            <div class="alert-box">
                <strong>Un paciente ha completado una evaluación en NeuroScale</strong>
            </div>
            <div style="margin: 20px 0;">
                <div class="info-row">
                <span class="info-label">Paciente:</span>
                <span class="info-value">${pacienteNombre}</span>
                </div>
                <div class="info-row">
                <span class="info-label">Escala:</span>
                <span class="info-value">${escalaNombre}</span>
                </div>
                <div class="info-row">
                <span class="info-label">Fecha:</span>
                <span class="info-value">${new Date().toLocaleString('es-AR', { 
                    dateStyle: 'long', 
                    timeStyle: 'short' 
                })}</span>
                </div>
            </div>
            <p>Podés revisar los resultados completos en tu panel de control:</p>
            <div style="text-align: center;">
                <a href="${dashboardURL || 'https://neuroscale.netlify.app/dashboard.html'}" 
                    class="button">
                Ver en el Panel
                </a>
            </div>     
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Este es un email automático de notificación. Los datos están seguros en tu plataforma.
            </p>
        </div>
            <div class="footer">
            <p>
                <strong>NeuroScale</strong><br>
                Plataforma de Evaluación Neurológica
            </p>
            <p style="margin-top: 10px;">
                Si tenés algún problema, contactá al soporte técnico.
            </p>
            </div>
        </div>
        </body>
        </html>
    `;
    // Enviar email con Resend
    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
        from: FROM_EMAIL,
        to: medicoEmail,
        subject: `Nueva evaluación: ${pacienteNombre} - ${escalaNombre}`,
        html: emailHTML,
        text: `Hola ${medicoNombre || 'Dr/Dra'},\n\nEl paciente ${pacienteNombre} ha completado la escala ${escalaNombre}.\n\nRevisá los resultados en: ${dashboardURL || 'tu panel de control'}\n\nFecha: ${new Date().toLocaleString('es-AR')}\n\n-- NeuroScale`
        })
    });
    const result = await response.json();
    if (!response.ok) {
        console.error('Error de Resend:', result);
        return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
            error: 'Error enviando email',
            details: result 
        })
        };
    }
    console.log('Email enviado:', result.id);
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
        success: true,
        emailId: result.id,
        message: 'Email enviado correctamente'
        })
    };
} catch (error) {
    console.error('Error en función:', error);
    return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
        error: 'Error interno del servidor',
        message: error.message 
        })
    };
}
};