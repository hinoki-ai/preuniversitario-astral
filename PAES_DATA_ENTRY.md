# Guía Práctica para Obtener y Cargar Tests PAES

## Paso 1: Obtener Tests Oficiales PAES

### Fuentes Oficiales

1. **Sitio DEMRE** (Departamento de Evaluación, Medición y Registro Educacional)
   - URL: `https://www.demre.cl/`
   - Buscar: "Pruebas anteriores" o "Ensayos PAES"

2. **Portal de Descargas DEMRE**
   - Buscar archivos PDF con nombres como:
     - "PAES_Matematica_M1_[año]_[semestre].pdf"
     - "PAES_Competencia_Lectora_[año]_[semestre].pdf"

3. **PrepaUniveritarios.cl**
   - Sitio: `https://prepauniversitarios.cl/`
   - Tienen ensayos y pruebas anteriores organizadas por materia

4. **Tu Aceptas**
   - Sitio: `https://tuaceptas.cl/`
   - Descargas gratuitas de pruebas PAES anteriores

## Paso 2: Estructura de los Tests PAES

Cada test PAES contiene:

- **45 preguntas** para pruebas regulares
- **4 alternativas** por pregunta (A, B, C, D)
- **Tiempo**: 2 horas (7200 segundos)
- **Módulos**:
  - Matemática M1 (para carreras no científicas)
  - Matemática M2 (para carreras científicas)
  - Competencia Lectora
  - Ciencias (Biología, Física, Química)
  - Historia y Ciencias Sociales

## Paso 3: Formato para Cargar Preguntas

### Plantilla Básica

```javascript
{
  text: "PREGUNTA COMPLETA AQUÍ",
  choices: ["ALTERNATIVA A", "ALTERNATIVA B", "ALTERNATIVA C", "ALTERNATIVA D"],
  correctIndex: 0, // 0=A, 1=B, 2=C, 3=D
  explanation: "EXPLICACIÓN DE POR QUÉ ES CORRECTA",
  competency: "COMPETENCIA ESPECÍFICA QUE EVALÚA"
}
```

### Ejemplo Real (Matemática M1)

```javascript
{
  text: "Si un número se multiplica por sí mismo da como resultado 16. ¿Cuál de las siguientes opciones representa este número?",
  choices: ["2", "4", "8", "16"],
  correctIndex: 1, // La respuesta correcta es "4"
  explanation: "4 × 4 = 16, por lo tanto el número es 4",
  competency: "Operaciones básicas y propiedades"
}
```

## Paso 4: Proceso de Carga Manual

### 1. Crear Plantilla

```javascript
import { PaesDataImporter } from '@/lib/paes-importer';

// Crear plantilla para Matemática M1 2024 Regular
const template = PaesDataImporter.generateTemplate('matematica_m1', 2024, 'Regular');
```

### 2. Agregar Preguntas Manualmente

```javascript
const testData = {
  ...template,
  questions: [
    {
      text: "Pregunta 1 aquí...",
      choices: ["A", "B", "C", "D"],
      correctIndex: 0,
      explanation: "Explicación aquí...",
      competency: "Competencia específica"
    },
    // Agregar las 45 preguntas del test...
  ]
};
```

### 3. Validar Datos

```javascript
const errors = PaesDataImporter.validateImportData(testData);
if (errors.length > 0) {
  console.log("Errores encontrados:", errors);
} else {
  console.log("Datos válidos!");
}
```

## Paso 5: Tests PAES Disponibles para Cargar

### Prioridad Alta

- [ ] PAES Matemática M1 · 2024 Proceso Regular
- [ ] PAES Competencia Lectora · 2024 Proceso Regular
- [ ] PAES Matemática M2 · 2024 Proceso Regular

### Prioridad Media

- [ ] PAES Ciencias M1 · 2024 Proceso Regular
- [ ] PAES Historia y CS · 2024 Proceso Regular

### Prioridad Baja

- [ ] PAES Matemática M1 · 2023 Invierno
- [ ] PAES Competencia Lectora · 2023 Invierno

## Paso 6: Tips Prácticos

### Para Extraer Preguntas de PDF

1. Abrir PDF oficial de DEMRE
2. Copiar pregunta completa
3. Copiar las 4 alternativas
4. Identificar respuesta correcta (generalmente al final del PDF)
5. Escribir explicación clara y concisa

### Para Identificar Competencias

- **Matemática M1**: Álgebra básica, geometría, estadística
- **Matemática M2**: Cálculo, funciones, trigonometría
- **Competencia Lectora**: Comprensión, inferencia, vocabulario
- **Ciencias**: Biología, Física, Química interdisciplinarias
- **Historia**: Contenido histórico, geográfico, cívico

## Paso 7: Verificación Final

Antes de cargar:

1. ✅ ¿Todas las preguntas tienen 4 alternativas?
2. ✅ ¿El índice correcto está entre 0-3?
3. ✅ ¿Hay explicación para cada pregunta?
4. ✅ ¿La competencia está identificada?
5. ✅ ¿El número total de preguntas es correcto (45)?

## Paso 8: Cargar en el Sistema

```javascript
import { createPaesTestData } from '@/data/paes-tests';
import { PaesDataImporter } from '@/lib/paes-importer';

// Convertir datos validados a formato del sistema
const paesTest = createPaesTestData(template, testData.questions);

// El test ya está listo para usar en el simulador
```

---

**Nota**: Comienza con 5-10 preguntas de un test para probar el sistema,
luego expande a tests completos. ¡Es mejor tener pocos tests de calidad que
muchos con errores!
