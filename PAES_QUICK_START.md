# 🚀 Inicio Rápido PAES - Guía Práctica

## Tu simulador ya está funcionando, ahora agreguemos datos reales

### Paso 1: Generar plantilla de test

```bash
# Crear plantilla para Matemática M1 2024 Regular
npm run tsx scripts/paes-data-cli.ts generate matematica_m1 2024 Regular
```

### Paso 2: Obtener preguntas reales PAES

1. Ve a [DEMRE.cl](https://www.demre.cl/)
2. Busca "Pruebas anteriores" o descarga PDFs oficiales
3. Abre el PDF de "PAES_Matematica_M1_2024_Regular.pdf"

### Paso 3: Llenar la plantilla

Edita el archivo `data/matematica_m1-2024-regular.template.json`:

```json
{
  "questions": [
    {
      "text": "COPIA LA PREGUNTA COMPLETA DEL PDF",
      "choices": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "EXPLICACIÓN DE POR QUÉ ES CORRECTA",
      "competency": "COMPETENCIA QUE EVALÚA"
    }
  ]
}
```

### Paso 4: Validar los datos

```bash
npm run tsx scripts/paes-data-cli.ts validate data/matematica_m1-2024-regular.template.json
```

### Paso 5: Ver conversiones disponibles

```bash
npm run tsx scripts/paes-data-cli.ts convert data/matematica_m1-2024-regular.template.json
```

### Paso 6: Copiar código generado a seed.ts

Los statements generados van directo a tu archivo `convex/seed.ts` para cargar en la base de datos.

## 🎯 Tu Sistema Actual

Tu simulador funciona con:

- ✅ Convex database (datos reales)
- ✅ Demo data (fallback)
- ✅ Validación automática
- ✅ Conversiones de formato

## 📊 Verificar progreso

```bash
npm run tsx scripts/paes-data-cli.ts stats data/matematica_m1-2024-regular.template.json
```

## 🎉 Próximos pasos

1. Llena 5 preguntas para probar
2. Carga en Convex con los statements generados
3. Repite para otros módulos (M2, Lectora, etc.)

---

**Recuerda**: Tu simulador YA funciona. Solo necesitas agregar preguntas reales
paso a paso. ¡No necesitas buscar en la web - solo copia de los PDFs oficiales
de DEMRE!
