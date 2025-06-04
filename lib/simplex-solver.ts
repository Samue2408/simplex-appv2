export class SimplexSolver {
  private objectiveType: "max" | "min"
  private objectiveCoefficients: number[]
  private constraintCoefficients: number[][]
  private constraintValues: number[]
  private constraintTypes: string[]
  private numVariables: number
  private numConstraints: number
  private numSlackVariables = 0
  private numSurplusVariables = 0
  private numArtificialVariables = 0

  constructor(
    objectiveType: "max" | "min",
    objectiveCoefficients: number[],
    constraintCoefficients: number[][],
    constraintValues: number[],
    constraintTypes: string[],
  ) {
    this.objectiveType = objectiveType
    this.objectiveCoefficients = [...objectiveCoefficients]
    this.constraintCoefficients = constraintCoefficients.map((row) => [...row])
    this.constraintValues = [...constraintValues]
    this.constraintTypes = [...constraintTypes]
    this.numVariables = objectiveCoefficients.length
    this.numConstraints = constraintValues.length

  }

  solve() {
    // Generar la forma estandarizada
    const standardizedForm = this.generateStandardizedForm()
    // Si es un problema de minimización, convertimos a maximización
    if (this.objectiveType === "min") {
      this.objectiveCoefficients = this.objectiveCoefficients.map((coef) => -coef)
    }
  

    // Contar variables de holgura, exceso y artificiales
    this.countVariables()

    // Crear la tabla inicial
    const initialTableau = this.createInitialTableau()

    // Resolver usando el método simplex
    const { tableaus, solution } = this.simplexMethod(initialTableau)

    // Si era un problema de minimización, ajustar el valor óptimo
    if (this.objectiveType === "min") {
      solution.optimalValue = -solution.optimalValue
    }

      return { tableaus, solution, standardizedForm }
  }

  private generateStandardizedForm() {
    // Generar representación del problema original
    const originalObjective = this.generateOriginalObjective()
    const originalConstraints = this.generateOriginalConstraints()

    // Generar transformaciones
    const transformations = this.generateTransformations()

    // Contar variables que se añadirán
    const variablesAdded = this.countVariablesToAdd()

    // Generar representación del problema estandarizado
    const standardizedObjective = this.generateStandardizedObjective()
    const standardizedConstraints = this.generateStandardizedConstraints()

    return {
      originalObjective,
      standardizedObjective,
      originalConstraints,
      standardizedConstraints,
      variablesAdded,
      transformations,
    }
  }

  private generateOriginalObjective(): string {
    const type = this.objectiveType === "max" ? "Maximizar" : "Minimizar"
    let objective = `${type} Z = `

    for (let i = 0; i < this.numVariables; i++) {
      const coef = this.objectiveCoefficients[i]
      if (i === 0) {
        objective += `${coef}x₍${i + 1}₎`
      } else {
        objective += coef >= 0 ? ` + ${coef}x₍${i + 1}₎` : ` - ${Math.abs(coef)}x₍${i + 1}₎`
      }
    }

    return objective
  }

  private generateOriginalConstraints(): string[] {
    const constraints: string[] = []

    for (let i = 0; i < this.numConstraints; i++) {
      let constraint = ""

      for (let j = 0; j < this.numVariables; j++) {
        const coef = this.constraintCoefficients[i][j]
        if (j === 0) {
          constraint += `${coef}x₍${j + 1}₎`
        } else {
          constraint += coef >= 0 ? ` + ${coef}x₍${j + 1}₎` : ` - ${Math.abs(coef)}x₍${j + 1}₎`
        }
      }

      const operator = this.constraintTypes[i] === "<=" ? "≤" : this.constraintTypes[i] === ">=" ? "≥" : "="
      constraint += ` ${operator} ${this.constraintValues[i]}`

      constraints.push(constraint)
    }

    return constraints
  }

  private generateTransformations(): string[] {
    const transformations: string[] = []

    if (this.objectiveType === "min") {
      transformations.push("Convertir problema de minimización a maximización multiplicando la función objetivo por -1")
    }

    let slackCount = 1
    let surplusCount = 1
    let artificialCount = 1

    for (let i = 0; i < this.numConstraints; i++) {
      const type = this.constraintTypes[i]

      if (type === "<=") {
        transformations.push(`Restricción ${i + 1}: Añadir variable de holgura S₍${slackCount}₎`)
        slackCount++
      } else if (type === ">=") {
        transformations.push(
          `Restricción ${i + 1}: Añadir variable de exceso E₍${surplusCount}₎ y variable artificial A₍${artificialCount}₎`,
        )
        surplusCount++
        artificialCount++
      } else if (type === "=") {
        transformations.push(`Restricción ${i + 1}: Añadir variable artificial A₍${artificialCount}₎`)
        artificialCount++
      }
    }

    if (artificialCount > 1) {
      transformations.push("Aplicar método de la M grande para penalizar variables artificiales en la función objetivo")
    }

    return transformations
  }

  private countVariablesToAdd() {
    let slack = 0
    let surplus = 0
    let artificial = 0

    for (const type of this.constraintTypes) {
      if (type === "<=") {
        slack++
      } else if (type === ">=") {
        surplus++
        artificial++
      } else if (type === "=") {
        artificial++
      }
    }

    return { slack, surplus, artificial }
  }

  private generateStandardizedObjective(): string {
    const type = "Maximizar" // Siempre maximizar en forma estándar
    let objective = `${type} Z = `

    // Coeficientes originales (posiblemente modificados si era minimización)
    const coeffs = this.objectiveType === "min" ? this.objectiveCoefficients.map((c) => -c) : this.objectiveCoefficients

    for (let i = 0; i < this.numVariables; i++) {
      const coef = coeffs[i]
      if (i === 0) {
        objective += `${coef}x₍${i + 1}₎`
      } else {
        objective += coef >= 0 ? ` + ${coef}x₍${i + 1}₎` : ` - ${Math.abs(coef)}x₍${i + 1}₎`
      }
    }

    // Las variables de holgura, exceso y artificiales tienen coeficiente 0 en la función objetivo
    // (excepto las artificiales que tienen coeficiente -M)

    return objective
  }

  private generateStandardizedConstraints(): string[] {
    const constraints: string[] = []

    let slackIndex = 1
    let surplusIndex = 1
    let artificialIndex = 1

    for (let i = 0; i < this.numConstraints; i++) {
      let constraint = ""

      // Variables originales
      for (let j = 0; j < this.numVariables; j++) {
        const coef = this.constraintCoefficients[i][j]
        if (j === 0) {
          constraint += `${coef}x₍${j + 1}₎`
        } else {
          constraint += coef >= 0 ? ` + ${coef}x₍${j + 1}₎` : ` - ${Math.abs(coef)}x₍${j + 1}₎`
        }
      }

      // Variables añadidas según el tipo de restricción
      if (this.constraintTypes[i] === "<=") {
        constraint += ` + S₍${slackIndex}₎`
        slackIndex++
      } else if (this.constraintTypes[i] === ">=") {
        constraint += ` - E₍${surplusIndex}₎ + A₍${artificialIndex}₎`
        surplusIndex++
        artificialIndex++
      } else if (this.constraintTypes[i] === "=") {
        constraint += ` + A₍${artificialIndex}₎`
        artificialIndex++
      }

      constraint += ` = ${this.constraintValues[i]}`
      constraints.push(constraint)
    }

    return constraints
  }

  private countVariables() {
    for (const type of this.constraintTypes) {
      if (type === "<=") {
        this.numSlackVariables++
      } else if (type === ">=") {
        this.numSurplusVariables++
        this.numArtificialVariables++
      } else if (type === "=") {
        this.numArtificialVariables++
      }
    }
  }

  private createInitialTableau() {
    const totalVariables =
      this.numVariables + this.numSlackVariables + this.numSurplusVariables + this.numArtificialVariables

    // Crear matriz con ceros
    const matrix: number[][] = Array(this.numConstraints + 1)
      .fill(0)
      .map(() => Array(totalVariables + 1).fill(0))

    // Llenar la fila de la función objetivo (Z)
    for (let j = 0; j < this.numVariables; j++) {
      matrix[this.numConstraints][j] = -this.objectiveCoefficients[j]
    }

    // Llenar las filas de restricciones
    let slackIndex = this.numVariables
    let surplusIndex = this.numVariables + this.numSlackVariables
    let artificialIndex = this.numVariables + this.numSlackVariables + this.numSurplusVariables

    const basicVariables: string[] = []

    for (let i = 0; i < this.numConstraints; i++) {
      // Coeficientes de las variables originales
      for (let j = 0; j < this.numVariables; j++) {
        matrix[i][j] = this.constraintCoefficients[i][j]
      }

      // Lado derecho (RHS)
      matrix[i][totalVariables] = this.constraintValues[i]

      // Manejar restricciones según su tipo
      if (this.constraintTypes[i] === "<=") {
        // Agregar variable de holgura
        matrix[i][slackIndex] = 1
        basicVariables.push(`S${slackIndex - this.numVariables + 1}`)
        slackIndex++
      } else if (this.constraintTypes[i] === ">=") {
        // Agregar variable de exceso
        matrix[i][surplusIndex] = -1

        // Agregar variable artificial
        matrix[i][artificialIndex] = 1

        // Penalizar la función objetivo para la variable artificial (método M grande)
        matrix[this.numConstraints][artificialIndex] = 1000 //skkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk

        // Restar la fila i multiplicada por 1000 de la fila objetivo
        for (let j = 0; j <= totalVariables; j++) {
          matrix[this.numConstraints][j] -= 1000 * matrix[i][j]
        }

        basicVariables.push(
          `A${artificialIndex - this.numVariables - this.numSlackVariables - this.numSurplusVariables + 1}`,
        )
        surplusIndex++
        artificialIndex++
      } else if (this.constraintTypes[i] === "=") {
        // Agregar variable artificial
        matrix[i][artificialIndex] = 1

        // Penalizar la función objetivo para la variable artificial (método M grande)
        matrix[this.numConstraints][artificialIndex] = 1000

        // Restar la fila i multiplicada por 1000 de la fila objetivo
        for (let j = 0; j <= totalVariables; j++) {
          matrix[this.numConstraints][j] -= 1000 * matrix[i][j]
        }

        basicVariables.push(
          `A${artificialIndex - this.numVariables - this.numSlackVariables - this.numSurplusVariables + 1}`,
        )
        artificialIndex++
      }
    }

    // Agregar Z a las variables básicas
    basicVariables.push("Z")

    // Crear nombres para variables no básicas
    const nonBasicVariables: string[] = []

    // Variables originales
    for (let j = 0; j < this.numVariables; j++) {
      nonBasicVariables.push(`x${j + 1}`)
    }

    // Variables de holgura
    for (let j = 0; j < this.numSlackVariables; j++) {
      nonBasicVariables.push(`S${j + 1}`)
    }

    // Variables de exceso
    for (let j = 0; j < this.numSurplusVariables; j++) {
      nonBasicVariables.push(`E${j + 1}`)
    }

    // Variables artificiales
    for (let j = 0; j < this.numArtificialVariables; j++) {
      nonBasicVariables.push(`A${j + 1}`)
    }

    // RHS
    nonBasicVariables.push("RHS")

    return {
      matrix,
      basicVariables,
      nonBasicVariables,
    }
  }

  private simplexMethod(initialTableau: { 
    matrix: number[][]; 
    basicVariables: string[]; 
    nonBasicVariables: string[]; 
    enteringVar?: string;
    leavingVar?: string;
    pivotElement?: number;
    pivotRow?: number;
    pivotCol?: number;
  }) {
    const tableaus = [{ ...initialTableau }]
    let currentTableau = { ...initialTableau }

    while (true) {
      // Encontrar la variable entrante (columna pivote)
      const pivotCol = this.findPivotColumn(currentTableau.matrix)

      // Si no hay columna pivote, hemos terminado
      if (pivotCol === -1) {
        break
      }

      // Encontrar la variable saliente (fila pivote)
      const pivotRow = this.findPivotRow(currentTableau.matrix, pivotCol)

      // Si no hay fila pivote, el problema es no acotado
      if (pivotRow === -1) {
        throw new Error("No hay fila pivote,")
      }

      // Guardar información sobre el pivote
      currentTableau.enteringVar = currentTableau.nonBasicVariables[pivotCol]
      currentTableau.leavingVar = currentTableau.basicVariables[pivotRow]
      currentTableau.pivotElement = currentTableau.matrix[pivotRow][pivotCol]
      currentTableau.pivotRow = pivotRow
      currentTableau.pivotCol = pivotCol

      // Guardar la tabla actual con la información del pivote
      tableaus[tableaus.length - 1] = { ...currentTableau }

      // Crear una nueva tabla para la siguiente iteración
      const newTableau = this.pivot(currentTableau, pivotRow, pivotCol)

      // Actualizar las variables básicas y no básicas
      newTableau.basicVariables = [...currentTableau.basicVariables]
      newTableau.nonBasicVariables = [...currentTableau.nonBasicVariables]

      // Intercambiar la variable entrante y saliente
      newTableau.basicVariables[pivotRow] = currentTableau.nonBasicVariables[pivotCol]

      // Guardar la tabla actual y actualizar para la siguiente iteración
      tableaus.push({ ...newTableau })
      currentTableau = { ...newTableau }
    }

    // Extraer la solución
    const solution = this.extractSolution(currentTableau)

    return { tableaus, solution }
  }

  private findPivotColumn(matrix: number[][]) {
    const lastRow = matrix[matrix.length - 1]
    let minValue = 0
    let minIndex = -1

    // Buscar el coeficiente más negativo en la fila de la función objetivo
    for (let j = 0; j < lastRow.length - 1; j++) {
      if (lastRow[j] < minValue) {
        minValue = lastRow[j]
        minIndex = j
      }
    }

    return minIndex
  }

  private findPivotRow(matrix: number[][], pivotCol: number) {
    let minRatio = Number.POSITIVE_INFINITY
    let minIndex = -1

    // Calcular los ratios y encontrar el mínimo positivo
    for (let i = 0; i < matrix.length - 1; i++) {
      if (matrix[i][pivotCol] > 0) {
        const ratio = matrix[i][matrix[0].length - 1] / matrix[i][pivotCol]
        if (ratio < minRatio) {
          minRatio = ratio
          minIndex = i
        }
      }
    }

    return minIndex
  }

  private pivot(
    tableau: { 
      matrix: number[][]; 
      basicVariables: string[]; 
      nonBasicVariables: string[]; 
    }, 
    pivotRow: number, 
    pivotCol: number
  ) {
    const { matrix, basicVariables, nonBasicVariables } = tableau
    const newMatrix = matrix.map((row) => [...row])
    const pivotElement = matrix[pivotRow][pivotCol]

    // Normalizar la fila pivote
    for (let j = 0; j < newMatrix[0].length; j++) {
      newMatrix[pivotRow][j] /= pivotElement
    }

    // Actualizar las demás filas
    for (let i = 0; i < newMatrix.length; i++) {
      if (i !== pivotRow) {
        const factor = newMatrix[i][pivotCol]
        for (let j = 0; j < newMatrix[0].length; j++) {
          newMatrix[i][j] -= factor * newMatrix[pivotRow][j]
        }
      }
    }

    return { 
      matrix: newMatrix,
      basicVariables: basicVariables ? [...basicVariables] : [],
      nonBasicVariables: nonBasicVariables ? [...nonBasicVariables] : []
    }
  }

  private extractSolution(finalTableau: { 
    matrix: number[][]; 
    basicVariables: string[]; 
    nonBasicVariables?: string[];
    enteringVar?: string;
    leavingVar?: string;
    pivotElement?: number;
    pivotRow?: number;
    pivotCol?: number;
  }) {
    const { matrix, basicVariables } = finalTableau
    const optimalValue = matrix[matrix.length - 1][matrix[0].length - 1]

    // Extraer valores de las variables de decisión
    const variables: number[] = Array(this.numVariables).fill(0)

    for (let i = 0; i < basicVariables.length - 1; i++) {
      const varName = basicVariables[i]
      if (varName.startsWith("x")) {
        const varIndex = Number.parseInt(varName.substring(1)) - 1
        variables[varIndex] = matrix[i][matrix[0].length - 1]
      }
    }

    return { optimalValue, variables }
  }
}
