/* BASE DE ESCALAS - NeuroScale */
const SCALES_DATABASE = {
/*1) INCAT – Escala de Discapacidad*/
    incat: {
      id: "incat",
      name: "INCAT – Escala de Discapacidad",
      category: "CIDP",
      hasInterpretation: false,
      sections: [
        {
          title: "Discapacidad de piernas",
          questions: [
            {
              id: "incat_leg",
              text: "Evalúe la capacidad funcional de las piernas:",
              options: [
                { value: 5, label: "5 — En silla de ruedas; incapaz de caminar o pararse sin ayuda.", 
                img: "img/incat/leg-5.png" },
                { value: 4, label: "4 — Camina sólo dentro de casa con ayuda; no puede caminar al aire libre.", 
                img: "img/incat/leg-4.png" },
                { value: 3, label: "3 — Requiere dos apoyos (bastones, muletas o andador) para caminar al exterior.", 
                img: "img/incat/leg-3.png" },
                { value: 2, label: "2 — Requiere un solo apoyo (bastón, muleta) para caminar al exterior.", 
                img: "img/incat/leg-2.png" },
                { value: 1, label: "1 — Dificultad para caminar, pero puede caminar de forma independiente.", 
                img: "img/incat/leg-1.png" },
                { value: 0, label: "0 — Caminata normal, sin afectación.", 
                img: "img/incat/leg-0.png" }
              ]
            }
          ]
        },
  
        {
          title: "Discapacidad de brazos",
          questions: [
            {
              id: "incat_arm",
              text: "Evalúe la capacidad funcional de los brazos:",
              options: [
                { value: 5, label: "5 — Incapacidad para usar cualquiera de los brazos para actividades funcionales.", 
                img: "img/incat/arm-5.png" },
                { value: 4, label: "4 — Uno o ambos brazos usados sólo en pocas actividades básicas.", 
                img: "img/incat/arm-4.png" },
                { value: 3, label: "3 — Uno o ambos brazos pueden usarse en algunas actividades pero con dificultad.", 
                img: "img/incat/arm-3.png" },
                { value: 2, label: "2 — Debilidad moderada en uno o ambos brazos; afecta algunas actividades.", 
                img: "img/incat/arm-2.png" },
                { value: 1, label: "1 — Síntomas leves, pero funcionalidad prácticamente conservada.", 
                img: "img/incat/arm-1.png" },
                { value: 0, label: "0 — Brazos normales, sin afectación.", 
                img: "img/incat/arm-0.png" }
              ]
            }
          ]
        }
      ]
    },

/*2) MG-ADL – Actividades de la Vida Diaria en Miastenia Gravis*/
    mg_adl: {
      id: "mg_adl",
      name: "MG-ADL – Actividades de la Vida Diaria",
      category: "Miastenia Gravis",
      hasInterpretation: false,
      sections: [
        {
          title: "MG-ADL",
          questions: [
            {
              id: "talking",
              text: "Hablar",
              options: [
                { value: 0, label: "Normal" },
                { value: 1, label: "Disartria intermitente o voz nasal" },
                { value: 2, label: "Disartria constante pero comprensible" },
                { value: 3, label: "Dificultad severa para hablar" }
              ]
            },
            {
              id: "chewing",
              text: "Masticación",
              options: [
                { value: 0, label: "Normal" },
                { value: 1, label: "Fatiga al masticar alimentos sólidos" },
                { value: 2, label: "Fatiga incluso con alimentos blandos" },
                { value: 3, label: "Requiere sonda gástrica" }
              ]
            },
            {
              id: "swallowing",
              text: "Deglución",
              options: [
                { value: 0, label: "Normal" },
                { value: 1, label: "Episodio raro de atragantamiento" },
                { value: 2, label: "Atragantamientos frecuentes; necesita cambios en la dieta" },
                { value: 3, label: "Requiere sonda gástrica" }
              ]
            },
            {
              id: "breathing",
              text: "Respiración",
              options: [
                { value: 0, label: "Normal" },
                { value: 1, label: "Disnea con esfuerzo" },
                { value: 2, label: "Disnea en reposo" },
                { value: 3, label: "Dependencia de ventilación" }
              ]
            },
            {
              id: "brush_hair",
              text: "Cepillarse el pelo / funciones similares",
              options: [
                { value: 0, label: "Normal" },
                { value: 1, label: "Esfuerzo adicional, sin necesidad de descanso" },
                { value: 2, label: "Necesita pausas" },
                { value: 3, label: "No puede realizar la tarea" }
              ]
            },
            {
              id: "chair",
              text: "Levantarse de una silla",
              options: [
                { value: 0, label: "Normal" },
                { value: 1, label: "Leve dificultad, a veces usa los brazos" },
                { value: 2, label: "Necesita usar los brazos siempre" },
                { value: 3, label: "Requiere ayuda de otra persona" }
              ]
            },
            {
              id: "double_vision",
              text: "Visión doble",
              options: [
                { value: 0, label: "No ocurre" },
                { value: 1, label: "Ocurre ocasionalmente" },
                { value: 2, label: "Ocurre diariamente" },
                { value: 3, label: "Constante" }
              ]
            },
            {
              id: "eyelid",
              text: "Caída del párpado",
              options: [
                { value: 0, label: "No ocurre" },
                { value: 1, label: "Ocurre ocasionalmente" },
                { value: 2, label: "Diario" },
                { value: 3, label: "Constante" }
              ]
            }
          ]
        }
      ]
    },

/*3) MG Composite Scale*/
    mg_composite: {
      id: "mg_composite",
      name: "MG Composite Scale",
      category: "Miastenia Gravis",
      hasInterpretation: false,
      sections: [
        {
          title: "MG Composite Scale",
          questions: [
            {
              id: "ptosis",
              text: "Ptosis (caída del párpado) – examen físico",
              options: [
                { value: 0, label: "Normal (>45 segundos sin caída)" },
                { value: 1, label: "Debilidad leve (11–45 segundos)" },
                { value: 2, label: "Debilidad moderada (1–10 segundos)" },
                { value: 3, label: "Inmediata" }
              ]
            },
            {
              id: "doublevision2",
              text: "Visión doble en mirada lateral – examen físico",
              options: [
                { value: 0, label: "Normal (>45 segundos)" },
                { value: 1, label: "Leve (11–45 segundos)" },
                { value: 3, label: "Moderada (1–10 segundos)" },
                { value: 4, label: "Inmediata" }
              ]
            },
            {
              id: "eye_closure",
              text: "Fuerza de cierre palpebral – examen físico",
              options: [
                { value: 0, label: "Normal" },
                { value: 0, label: "Debilidad leve" },
                { value: 1, label: "Debilidad moderada" },
                { value: 2, label: "Debilidad severa" }
              ]
            },
            {
              id: "talking_cmp",
              text: "Habla – historia del paciente",
              options: [
                { value: 0, label: "Normal" },
                { value: 2, label: "Habla nasal o disartria intermitente" },
                { value: 4, label: "Habla nasal o disartria evidente" },
                { value: 6, label: "Habla ininteligible" }
              ]
            },
            {
              id: "chewing_cmp",
              text: "Masticación – historia del paciente",
              options: [
                { value: 0, label: "Normal" },
                { value: 2, label: "Fatiga con alimentos sólidos" },
                { value: 4, label: "Fatiga incluso con alimentos blandos" },
                { value: 6, label: "Requiere sonda gástrica" }
              ]
            },
            {
              id: "swallowing_cmp",
              text: "Deglución – historia del paciente",
              options: [
                { value: 0, label: "Normal" },
                { value: 2, label: "Episodio raro de atragantamiento" },
                { value: 5, label: "Atragantamiento frecuente" },
                { value: 6, label: "Requiere sonda gástrica" }
              ]
            },
            {
              id: "breathing_cmp",
              text: "Respiración – historia del paciente",
              options: [
                { value: 0, label: "Normal" },
                { value: 1, label: "Disnea con esfuerzo" },
                { value: 2, label: "Disnea en reposo" },
                { value: 9, label: "Dependencia ventilatoria" }
              ]
            }
          ]
        }
      ]
    },

/*4) RODS – Rasch-built Overall Disability Scale*/
    rods: {
    id: "rods",
    name: "RODS – Escala Global de Discapacidad",
    category: "Neuromuscular",
    hasInterpretation: false,
    sections: [
      {
        title: "Actividades habituales",
        questions: [
          {
            id: "rods_1",
            text: "Leer un diario o un libro",
            options: [
              { value: 0, label: "No me es posible" },
              { value: 1, label: "Posible, pero con dificultad" },
              { value: 2, label: "Posible, sin dificultad" }
            ]
          },
          {
            id: "rods_2",
            text: "Comer",
            options: [
              { value: 0, label: "No me es posible" },
              { value: 1, label: "Posible, pero con dificultad" },
              { value: 2, label: "Posible, sin dificultad" }
            ]
          },
          {
            id: "rods_3",
            text: "Cepillarse los dientes",
            options: [
              { value: 0, label: "No me es posible" },
              { value: 1, label: "Posible, pero con dificultad" },
              { value: 2, label: "Posible, sin dificultad" }
            ]
          },
          {
            id: "rods_4",
            text: "Lavar la parte superior del cuerpo",
            options: [
              { value: 0, label: "No me es posible" },
              { value: 1, label: "Posible, pero con dificultad" },
              { value: 2, label: "Posible, sin dificultad" }
            ]
          },
          {
            id: "rods_5",
            text: "Ir al baño",
            options: [
              { value: 0, label: "No me es posible" },
              { value: 1, label: "Posible, pero con dificultad" },
              { value: 2, label: "Posible, sin dificultad" }
            ]
          },
          {
            id: "rods_6",
            text: "Preparar una merienda o snack",
            options: [
              { value: 0, label: "No me es posible" },
              { value: 1, label: "Posible, pero con dificultad" },
              { value: 2, label: "Posible, sin dificultad" }
            ]
          },
          {
            id: "rods_7",
            text: "Ponerse ropa en la parte superior del cuerpo",
            options: [
              { value: 0, label: "No me es posible" },
              { value: 1, label: "Posible, pero con dificultad" },
              { value: 2, label: "Posible, sin dificultad" }
            ]
          },
          {
            id: "rods_8",
            text: "Lavar la parte inferior del cuerpo",
            options: [
              { value: 0, label: "No me es posible" },
              { value: 1, label: "Posible, pero con dificultad" },
              { value: 2, label: "Posible, sin dificultad" }
            ]
          },
          {
            id: "rods_9",
            text: "Mover una silla",
            options: [
              { value: 0, label: "No me es posible" },
              { value: 1, label: "Posible, pero con dificultad" },
              { value: 2, label: "Posible, sin dificultad" }
            ]
          },
          {
            id: "rods_10",
            text: "Usar una llave para abrir una cerradura",
            options: [
              { value: 0, label: "No me es posible" },
              { value: 1, label: "Posible, pero con dificultad" },
              { value: 2, label: "Posible, sin dificultad" }
            ]
          },
          {
            id: "rods_11",
            text: "Ir al médico de cabecera",
            options: [
              { value: 0, label: "No me es posible" },
              { value: 1, label: "Posible, pero con dificultad" },
              { value: 2, label: "Posible, sin dificultad" }
            ]
          },
          {
            id: "rods_12",
            text: "Tomar una ducha",
            options: [
              { value: 0, label: "No me es posible" },
              { value: 1, label: "Posible, pero con dificultad" },
              { value: 2, label: "Posible, sin dificultad" }
            ]
          },
          {
            id: "rods_13",
            text: "Lavar los platos",
            options: [
              { value: 0, label: "No me es posible" },
              { value: 1, label: "Posible, pero con dificultad" },
              { value: 2, label: "Posible, sin dificultad" }
            ]
          },
          {
            id: "rods_14",
            text: "Hacer las compras",
            options: [
              { value: 0, label: "No me es posible" },
              { value: 1, label: "Posible, pero con dificultad" },
              { value: 2, label: "Posible, sin dificultad" }
            ]
          },
          {
            id: "rods_15",
            text: "Levantar un objeto (por ejemplo, una pelota)",
            options: [
              { value: 0, label: "No me es posible" },
              { value: 1, label: "Posible, pero con dificultad" },
              { value: 2, label: "Posible, sin dificultad" }
            ]
          },
          {
            id: "rods_16",
            text: "Agacharse para levantar un objeto",
            options: [
              { value: 0, label: "No me es posible" },
              { value: 1, label: "Posible, pero con dificultad" },
              { value: 2, label: "Posible, sin dificultad" }
            ]
          },
          {
            id: "rods_17",
            text: "Subir un tramo de escaleras",
            options: [
              { value: 0, label: "No me es posible" },
              { value: 1, label: "Posible, pero con dificultad" },
              { value: 2, label: "Posible, sin dificultad" }
            ]
          },
          {
            id: "rods_18",
            text: "Viajar en transporte público",
            options: [
              { value: 0, label: "No me es posible" },
              { value: 1, label: "Posible, pero con dificultad" },
              { value: 2, label: "Posible, sin dificultad" }
            ]
          },
          {
            id: "rods_19",
            text: "Caminar alrededor de obstáculos",
            options: [
              { value: 0, label: "No me es posible" },
              { value: 1, label: "Posible, pero con dificultad" },
              { value: 2, label: "Posible, sin dificultad" }
            ]
          },
          {
            id: "rods_20",
            text: "Caminar hasta 1 km",
            options: [
              { value: 0, label: "No me es posible" },
              { value: 1, label: "Posible, pero con dificultad" },
              { value: 2, label: "Posible, sin dificultad" }
            ]
          },
          {
            id: "rods_21",
            text: "Llevar un objeto pesado y colocarlo en el suelo",
            options: [
              { value: 0, label: "No me es posible" },
              { value: 1, label: "Posible, pero con dificultad" },
              { value: 2, label: "Posible, sin dificultad" }
            ]
          },
          {
            id: "rods_22",
            text: "Bailar",
            options: [
              { value: 0, label: "No me es posible" },
              { value: 1, label: "Posible, pero con dificultad" },
              { value: 2, label: "Posible, sin dificultad" }
            ]
          },
          {
            id: "rods_23",
            text: "Estar de pie durante largo tiempo (p. ej. varias horas)",
            options: [
              { value: 0, label: "No me es posible" },
              { value: 1, label: "Posible, pero con dificultad" },
              { value: 2, label: "Posible, sin dificultad" }
            ]
          },
          {
            id: "rods_24",
            text: "Correr",
            options: [
              { value: 0, label: "No me es posible" },
              { value: 1, label: "Posible, pero con dificultad" },
              { value: 2, label: "Posible, sin dificultad" }
            ]
          }
        ]
      }
    ]
  },

/*5)SARA – Scale for the Assessment and Rating of Ataxia*/
    sara: {
    id: "sara",
    name: "SARA – Evaluación de Ataxia",
    category: "Ataxia",
    hasInterpretation: false,
    sections: [
      {
        title: "SARA – Evaluación",
        questions: [
          /* 1) Marcha */
          {
            id: "sara_gait",
            text: "Marcha",
            options: [
              { value: 0, label: "0 — Normal, sin dificultad al caminar ni girar." },
              { value: 1, label: "1 — Dificultades leves: marcha insegura, ligera oscilación o paso incorrecto ocasional, pero sin apoyo." },
              { value: 2, label: "2 — Marcha claramente alterada; camina 10 pasos en tándem pero con inestabilidad evidente." },
              { value: 3, label: "3 — Marcha claramente tambaleante; desviaciones, base ancha pero sin apoyo." },
              { value: 4, label: "4 — Marcha muy inestable; necesita apoyo intermitente del examinador o baranda." },
              { value: 5, label: "5 — Necesita apoyo constante por un lado para caminar." },
              { value: 6, label: "6 — Camina solo unos pocos pasos con apoyo bilateral." },
              { value: 7, label: "7 — Incapaz de caminar incluso con apoyo; solo puede mantenerse en pie brevemente." },
              { value: 8, label: "8 — Incapaz de caminar; no puede mantenerse en pie." }
            ]
          },
          /* 2) Bipedestación */
          {
            id: "sara_stance",
            text: "Bipedestación (de pie)",
            options: [
              { value: 0, label: "0 — Mantiene posición natural >10 s sin oscilaciones excesivas." },
              { value: 1, label: "1 — Mantiene de pie >10 s, pero con oscilaciones evidentes." },
              { value: 2, label: "2 — Mantiene pies juntos >10 s, pero no más de 10 s con apoyo reducido." },
              { value: 3, label: "3 — Mantiene de pie >10 s sin apoyo, pero solo en base amplia." },
              { value: 4, label: "4 — Mantiene la posición natural solo con apoyo intermitente." },
              { value: 5, label: "5 — Necesita apoyo constante para mantenerse de pie." },
              { value: 6, label: "6 — No puede mantenerse de pie ni con apoyo." }
            ]
          },
          /* 3) Sedestación */
          {
            id: "sara_sitting",
            text: "Sedestación (sentado)",
            options: [
              { value: 0, label: "0 — Normal; permanece estable sin apoyo." },
              { value: 1, label: "1 — Leve inestabilidad intermitente." },
              { value: 2, label: "2 — Oscilaciones frecuentes, pero puede permanecer sentado >10 s sin apoyo." },
              { value: 3, label: "3 — Necesita apoyo intermitente para sentarse." },
              { value: 4, label: "4 — Incapaz de sentarse sin apoyo continuo." }
            ]
          },
          /* 4) Habla */
          {
            id: "sara_speech",
            text: "Habla",
            options: [
              { value: 0, label: "0 — Normal." },
              { value: 1, label: "1 — Habla levemente alterada, siempre comprensible." },
              { value: 2, label: "2 — Habla moderadamente alterada, difícil de entender ocasionalmente." },
              { value: 3, label: "3 — Habla severamente alterada, difícil de entender frecuentemente." },
              { value: 4, label: "4 — Habla ininteligible o anártrica." }
            ]
          },
          /* 5) Persecución con dedo (Finger Chase) */
          {
            id: "sara_finger_chase",
            text: "Persecución con el dedo",
            options: [
              { value: 0, label: "0 — Sin dismetría; sigue el objetivo correctamente (<2 cm de error)." },
              { value: 1, label: "1 — Dismetría leve; error <5 cm." },
              { value: 2, label: "2 — Error moderado; 5–15 cm." },
              { value: 3, label: "3 — Error marcado; >15 cm." },
              { value: 4, label: "4 — Incapaz de realizar 5 movimientos dirigidos." }
            ]
          },
          /* 6) Prueba nariz-dedo */
          {
            id: "sara_nose_finger",
            text: "Prueba Nariz–Dedo",
            options: [
              { value: 0, label: "0 — Sin temblor o dismetría." },
              { value: 1, label: "1 — Temblor leve o dismetría <5 cm." },
              { value: 2, label: "2 — Temblor moderado o dismetría >5 cm." },
              { value: 3, label: "3 — Temblor severo; gran dificultad para alcanzar el objetivo." },
              { value: 4, label: "4 — Incapaz de realizar 5 movimientos." }
            ]
          },
          /* 7) Movimientos alternantes rápidos */
          {
            id: "sara_fast_hand",
            text: "Movimientos alternantes rápidos (mano)",
            options: [
              { value: 0, label: "0 — Normal; 10 ciclos completos sin dificultad." },
              { value: 1, label: "1 — Ligeramente irregular, leve desaceleración." },
              { value: 2, label: "2 — Irregular, claramente más lentos o difíciles de ejecutar." },
              { value: 3, label: "3 — Muy irregulares, lentos y mal definidos." },
              { value: 4, label: "4 — Incapaz de completar 10 ciclos." }
            ]
          },
          /* 8) Deslizar talón por la espinilla */
          {
            id: "sara_heel_shin",
            text: "Prueba talón–espinilla",
            options: [
              { value: 0, label: "0 — Normal; sin oscilaciones significativas." },
              { value: 1, label: "1 — Ligeramente anormal; pierde la línea 1–2 veces." },
              { value: 2, label: "2 — Moderadamente anormal; pierde la línea 3 veces." },
              { value: 3, label: "3 — Severamente anormal; movimientos erráticos o repetidamente fuera de la línea." },
              { value: 4, label: "4 — Incapaz de realizar la prueba." }
            ]
          }
        ]
      }
    ]
  },

/*6)QMG – Quantitative Myasthenia Gravis Score*/
    qmg: {
    id: "qmg",
    name: "QMG – Evaluación Cuantitativa de Miastenia Gravis",
    category: "Miastenia Gravis",
    hasInterpretation: false,
    sections: [
    {
      title: "QMG – Evaluación",
      questions: [
        /* 1) Visión doble en mirada lateral */
        {
          id: "qmg_double_vision",
          text: "Visión doble al mirar hacia un lado (segundos hasta que aparece)",
          options: [
            { value: 0, label: "0 — ≥ 61 segundos (normal)" },
            { value: 1, label: "1 — 11–60 segundos" },
            { value: 2, label: "2 — 1–10 segundos" },
            { value: 3, label: "3 — Inmediato / espontáneo" }
          ]
        },
        /* 2) Ptosis con mirada hacia arriba */
        {
          id: "qmg_ptosis",
          text: "Ptosis (caída del párpado) al mantener mirada hacia arriba",
          options: [
            { value: 0, label: "0 — ≥ 61 segundos sin caída" },
            { value: 1, label: "1 — 11–60 segundos" },
            { value: 2, label: "2 — 1–10 segundos" },
            { value: 3, label: "3 — Caída inmediata" }
          ]
        },
        /* 3) Músculos faciales */
        {
          id: "qmg_facial",
          text: "Fuerza de los músculos faciales (cierre ocular y expresión)",
          options: [
            { value: 0, label: "0 — Normal; cierre palpebral fuerte" },
            { value: 1, label: "1 — Completo pero débil; ofrece algo de resistencia" },
            { value: 2, label: "2 — Completo, sin resistencia" },
            { value: 3, label: "3 — Incompleto" }
          ]
        },
        /* 4) Deglutir 120 ml (½ taza) de agua */
        {
          id: "qmg_swallow",
          text: "Deglutir 120 ml (½ taza) de agua",
          options: [
            { value: 0, label: "0 — Normal" },
            { value: 1, label: "1 — Tos mínima o aclaramiento de garganta" },
            { value: 2, label: "2 — Tos/atragantamiento moderado o regurgitación nasal" },
            { value: 3, label: "3 — No puede tragar (no se intenta la prueba)" }
          ]
        },
        /* 5) Habla contando del 1 al 50 */
        {
          id: "qmg_speech",
          text: "Habla: contar del 1 al 50 sin detenerse",
          options: [
            { value: 0, label: "0 — Llega a 50 sin disartria" },
            { value: 1, label: "1 — Disartria aparece entre 30–49" },
            { value: 2, label: "2 — Disartria aparece entre 10–29" },
            { value: 3, label: "3 — Disartria a los 9 o antes" }
          ]
        },
        /* 6) Brazo derecho extendido (90°) */
        {
          id: "qmg_arm_right",
          text: "Elevar brazo derecho a 90° (segundos hasta caída)",
          options: [
            { value: 0, label: "0 — ≥ 240 s (normal)" },
            { value: 1, label: "1 — 90–239 s" },
            { value: 2, label: "2 — 10–89 s" },
            { value: 3, label: "3 — 0–9 s" }
          ]
        },
        /* 7) Brazo izquierdo extendido (90°) */
        {
          id: "qmg_arm_left",
          text: "Elevar brazo izquierdo a 90° (segundos hasta caída)",
          options: [
            { value: 0, label: "0 — ≥ 240 s (normal)" },
            { value: 1, label: "1 — 90–239 s" },
            { value: 2, label: "2 — 10–89 s" },
            { value: 3, label: "3 — 0–9 s" }
          ]
        },
        /* 8) Capacidad vital forzada */
        {
          id: "qmg_fvc",
          text: "Capacidad vital forzada (FVC, en % del valor esperado)",
          options: [
            { value: 0, label: "0 — ≥ 80%" },
            { value: 1, label: "1 — 65–79%" },
            { value: 2, label: "2 — 50–64%" },
            { value: 3, label: "3 — < 50%" }
          ]
        },
        /* 9) Fuerza de prensión — mano derecha */
        {
          id: "qmg_grip_right",
          text: "Fuerza de prensión derecha (kg)",
          options: [
            { value: 0, label: "0 — ≥ 45 kg (hombres) / ≥ 30 kg (mujeres)" },
            { value: 1, label: "1 — 15–44 kg (h) / 10–29 kg (m)" },
            { value: 2, label: "2 — 5–14 kg (h/m)" },
            { value: 3, label: "3 — 0–4 kg" }
          ]
        },
        /* 10) Fuerza de prensión — mano izquierda */
        {
          id: "qmg_grip_left",
          text: "Fuerza de prensión izquierda (kg)",
          options: [
            { value: 0, label: "0 — ≥ 45 kg (hombres) / ≥ 30 kg (mujeres)" },
            { value: 1, label: "1 — 15–44 kg (h) / 10–29 kg (m)" },
            { value: 2, label: "2 — 5–14 kg (h/m)" },
            { value: 3, label: "3 — 0–4 kg" }
          ]
        },
        /* 11) Cabeza elevada (45°) */
        {
          id: "qmg_head_lift",
          text: "Elevar y sostener la cabeza (45°) mientras está en supino",
          options: [
            { value: 0, label: "0 — ≥ 120 s" },
            { value: 1, label: "1 — 31–119 s" },
            { value: 2, label: "2 — 1–30 s" },
            { value: 3, label: "3 — 0 s (incapaz de elevar)" }
          ]
        },
        /* 12) Pierna derecha extendida */
        {
          id: "qmg_leg_right",
          text: "Elevar la pierna derecha (45°) en supino",
          options: [
            { value: 0, label: "0 — ≥ 240 s" },
            { value: 1, label: "1 — 90–239 s" },
            { value: 2, label: "2 — 10–89 s" },
            { value: 3, label: "3 — 0–9 s" }
          ]
        },
        /* 13) Pierna izquierda extendida */
        {
          id: "qmg_leg_left",
          text: "Elevar la pierna izquierda (45°) en supino",
          options: [
            { value: 0, label: "0 — ≥ 240 s" },
            { value: 1, label: "1 — 90–239 s" },
            { value: 2, label: "2 — 10–89 s" },
            { value: 3, label: "3 — 0–9 s" }
          ]
        }
      ]
    }
  ]
},
};