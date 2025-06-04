"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SimplexSolver } from "@/lib/simplex-solver"
import { SimplexTableau } from "@/components/simplex-tableau"
import { StandardizedForm } from "@/components/standardized-form"

export default function SimplexCalculator() {
  const [objectiveType, setObjectiveType] = useState<"max" | "min">("max")
  const [numVariables, setNumVariables] = useState<number>(2)
  const [numConstraints, setNumConstraints] = useState<number>(2)
  const [objectiveCoefficients, setObjectiveCoefficients] = useState<number[]>([1, 2])
  const [constraintCoefficients, setConstraintCoefficients] = useState<number[][]>([
    [1, 1],
    [2, 1],
  ])
  const [constraintValues, setConstraintValues] = useState<number[]>([6, 10])
  const [constraintTypes, setConstraintTypes] = useState<string[]>(["<=", "<="])
  const [tableaus, setTableaus] = useState<any[]>([])
  const [solution, setSolution] = useState<any>(null)
  const [standardizedProblem, setStandardizedProblem] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("input")

  const handleNumVariablesChange = (value: string) => {
    const num = Number.parseInt(value)
    setNumVariables(num)

    // Update objective coefficients
    setObjectiveCoefficients(Array(num).fill(0))

    // Update constraint coefficients
    const newConstraintCoefficients = Array(numConstraints)
      .fill(0)
      .map(() => Array(num).fill(0))
    setConstraintCoefficients(newConstraintCoefficients)
  }

  const handleNumConstraintsChange = (value: string) => {
    const num = Number.parseInt(value)
    setNumConstraints(num)

    // Update constraint coefficients, values, and types
    const newConstraintCoefficients = Array(num)
      .fill(0)
      .map(() => Array(numVariables).fill(0))
    setConstraintCoefficients(newConstraintCoefficients)
    setConstraintValues(Array(num).fill(0))
    setConstraintTypes(Array(num).fill("<="))
  }

  const handleObjectiveCoefficientChange = (index: number, value: string) => {
    const newCoefficients = [...objectiveCoefficients]
    newCoefficients[index] = Number.parseFloat(value) || 0
    setObjectiveCoefficients(newCoefficients)
  }

  const handleConstraintCoefficientChange = (rowIndex: number, colIndex: number, value: string) => {
    const newCoefficients = [...constraintCoefficients]
    newCoefficients[rowIndex][colIndex] = Number.parseFloat(value) || 0
    setConstraintCoefficients(newCoefficients)
  }

  const handleConstraintValueChange = (index: number, value: string) => {
    const newValues = [...constraintValues]
    newValues[index] = Number.parseFloat(value) || 0
    setConstraintValues(newValues)
  }

  const handleConstraintTypeChange = (index: number, value: string) => {
    const newTypes = [...constraintTypes]
    newTypes[index] = value
    setConstraintTypes(newTypes)
  }

  const solve = () => {
    try {
      setError(null)
      const solver = new SimplexSolver(
        objectiveType,
        objectiveCoefficients,
        constraintCoefficients,
        constraintValues,
        constraintTypes,
      )

      const { tableaus: resultTableaus, solution: resultSolution, standardizedForm } = solver.solve()
      setTableaus(resultTableaus)
      setSolution(resultSolution)
      setStandardizedProblem(standardizedForm)
      setActiveTab("standardized")
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al resolver el problema")
    }
  }

  return (
    <div className="container mx-auto py-[2rem]">
      <h1 className="text-3xl font-bold text-center">Calculadora del Método Simplex</h1>
      <p className="text-1xl font-light text-center">Samuel Maldonado Montero</p>
      <p className="text-1xl font-light text-center mb-8">Shaira Rico Echeverría</p>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="input">Datos de Entrada</TabsTrigger>
          <TabsTrigger value="standardized" disabled={!standardizedProblem}>
            Forma Estándar
          </TabsTrigger>
          <TabsTrigger value="results" disabled={tableaus.length === 0}>
            Resultados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input">
          <Card className="bg-[#f1f5f9]">
            <CardHeader>
              <CardTitle>Configuración del Problema</CardTitle>
              <CardDescription>Defina su problema de programación lineal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Tipo de Objetivo</Label>
                  <RadioGroup
                    value={objectiveType}
                    onValueChange={(value) => setObjectiveType(value as "max" | "min")}
                    className="flex space-x-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="max" id="max" />
                      <Label htmlFor="max">Maximizar</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="min" id="min" />
                      <Label htmlFor="min">Minimizar</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numVariables">Número de Variables</Label>
                    <Select value={numVariables.toString()} onValueChange={handleNumVariablesChange}>
                      <SelectTrigger id="numVariables">
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numConstraints">Número de Restricciones</Label>
                    <Select value={numConstraints.toString()} onValueChange={handleNumConstraintsChange}>
                      <SelectTrigger id="numConstraints">
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Función Objetivo</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{objectiveType === "max" ? "Maximizar" : "Minimizar"} Z =</span>
                  {objectiveCoefficients.map((coef, index) => (
                    <div key={`obj-${index}`} className="flex items-center">
                      {index > 0 && <span className="mx-1">+</span>}
                      <Input
                        type="number"
                        value={coef || ""}
                        onChange={(e) => handleObjectiveCoefficientChange(index, e.target.value)}
                        className="w-20"
                      />
                      <span className="ml-1">
                        x<sub>{index + 1}</sub>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Sujeto A:</h3>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Sujeto a:</p>
                    {Array.from({ length: numConstraints }).map((_, rowIndex) => (
                      <div key={`constraint-${rowIndex}`} className="flex flex-wrap items-center gap-2">
                        {constraintCoefficients[rowIndex]?.map((coef, colIndex) => (
                          <div key={`coef-${rowIndex}-${colIndex}`} className="flex items-center">
                            {colIndex > 0 && <span className="mx-1">+</span>}
                            <Input
                              type="number"
                              value={coef || ""}
                              onChange={(e) => handleConstraintCoefficientChange(rowIndex, colIndex, e.target.value)}
                              className="w-20"
                            />
                            <span className="ml-1">
                              x<sub>{colIndex + 1}</sub>
                            </span>
                          </div>
                        ))}

                        <Select
                          value={constraintTypes[rowIndex] || "<="}
                          onValueChange={(value) => handleConstraintTypeChange(rowIndex, value)}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="<=">≤</SelectItem>
                            <SelectItem value=">=">≥</SelectItem>
                            <SelectItem value="=">=</SelectItem>
                          </SelectContent>
                        </Select>

                        <Input
                          type="number"
                          value={constraintValues[rowIndex] || ""}
                          onChange={(e) => handleConstraintValueChange(rowIndex, e.target.value)}
                          className="w-20"
                        />
                      </div>
                    ))}
                  <div className="text-sm text-muted-foreground mt-2">
                    x<sub>i</sub> ≥ 0 para todo i
                  </div>
                </div>
              </div>

              {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
              
              <div className="flex justify-center">
                <Button onClick={solve} className="mx-auto">
                  Resolver
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="standardized">
          <Card>
            <CardHeader>
              <CardTitle>Forma Estándar del Problema</CardTitle>
              <CardDescription>
                Transformación del problema original a la forma estándar para el método Simplex
              </CardDescription>
            </CardHeader>
            <CardContent>
              {standardizedProblem && <StandardizedForm standardizedProblem={standardizedProblem} />}
              <div className="mt-6 flex gap-4">
                <Button onClick={() => setActiveTab("input")} variant="outline">
                  Volver a Entrada
                </Button>
                <Button onClick={() => setActiveTab("results")}>Ver Solución</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Resultados del Método Simplex</CardTitle>
              <CardDescription>Proceso paso a paso de la solución</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {tableaus.map((tableau, index) => (
                <div key={`tableau-${index}`} className="space-y-2">
                  <h3 className="text-lg font-medium">Iteración {index + 1}</h3>

                  {index < tableaus.length - 1 && (
                    <div className="p-3 bg-muted rounded-md mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium text-green-600">Variable entrante:</p>
                          <p className="text-lg">{tableau.enteringVar}</p>
                          <p className="text-sm text-[#64748b]">
                            (Columna {tableau.pivotCol !== undefined ? tableau.pivotCol + 1 : "N/A"})
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-red-600">Variable saliente:</p>
                          <p className="text-lg">{tableau.leavingVar}</p>
                          <p className="text-sm text-[#64748b]">
                            (Fila {tableau.pivotRow !== undefined ? tableau.pivotRow + 1 : "N/A"})
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <p className="font-medium text-purple-600">Elemento pivote:</p>
                        <p className="text-lg">{tableau.pivotElement?.toFixed(2)}</p>
                        <p className="text-sm text-[#64748b]">
                          En posición ({tableau.pivotRow !== undefined ? tableau.pivotRow + 1 : "N/A"},
                          {tableau.pivotCol !== undefined ? tableau.pivotCol + 1 : "N/A"})
                        </p>
                      </div>
                    </div>
                  )}

                  <SimplexTableau tableau={tableau} />

                  {index === tableaus.length - 1 && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md mt-4">
                      <p className="font-medium text-green-700">Solución óptima encontrada</p>
                      <p className="text-sm text-[#64748b]">Esta es la tabla final del método Simplex</p>
                    </div>
                  )}
                </div>
              ))}

              {solution && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <h3 className="text-lg font-medium mb-2">Solución Óptima</h3>
                  <p>Valor óptimo: {solution.optimalValue}</p>
                  <div className="mt-2">
                    <p className="font-medium">Variables de decisión:</p>
                    <ul className="list-disc list-inside">
                      {solution.variables.map((value: number, index: number) => (
                        <li key={`var-${index}`}>
                          x<sub>{index + 1}</sub> = {value}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button onClick={() => setActiveTab("standardized")} variant="outline">
                  Ver Forma Estándar
                </Button>
                <Button onClick={() => setActiveTab("input")} variant="outline">
                  Volver a Entrada
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
