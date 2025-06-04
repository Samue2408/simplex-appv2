import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface StandardizedFormProps {
  standardizedProblem: {
    originalObjective: string
    standardizedObjective: string
    originalConstraints: string[]
    standardizedConstraints: string[]
    variablesAdded: {
      slack: number
      surplus: number
      artificial: number
    }
    transformations: string[]
  }
}

export function StandardizedForm({ standardizedProblem }: StandardizedFormProps) {
  const {
    originalObjective,
    standardizedObjective,
    originalConstraints,
    standardizedConstraints,
    variablesAdded,
    transformations,
  } = standardizedProblem

  return (
    <div className="space-y-6">
      {/* Problema Original */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Problema Original</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="font-mono text-sm">
            <p className="font-medium">{originalObjective}</p>
            <p className="text-muted-foreground mt-2">Sujeto a:</p>
            {originalConstraints.map((constraint, index) => (
              <p key={`orig-${index}`} className="ml-4">
                {constraint}
              </p>
            ))}
            <p className="ml-4 text-muted-foreground">x₍ᵢ₎ ≥ 0 para todo i</p>
          </div>
        </CardContent>
      </Card>

      {/* Transformaciones Aplicadas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transformaciones Aplicadas</CardTitle>
          <CardDescription>Pasos realizados para convertir a la forma estándar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transformations.map((transformation, index) => (
              <div key={`trans-${index}`} className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">
                  {index + 1}
                </Badge>
                <p className="text-sm">{transformation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Variables Añadidas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Variables Añadidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{variablesAdded.slack}</p>
              <p className="text-sm text-blue-600">Variables de Holgura</p>
              <p className="text-xs text-muted-foreground">Para restricciones ≤</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{variablesAdded.surplus}</p>
              <p className="text-sm text-orange-600">Variables de Exceso</p>
              <p className="text-xs text-muted-foreground">Para restricciones ≥</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{variablesAdded.artificial}</p>
              <p className="text-sm text-purple-600">Variables Artificiales</p>
              <p className="text-xs text-muted-foreground">Para restricciones ≥ y =</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Problema Estandarizado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Problema en Forma Estándar</CardTitle>
          <CardDescription>Listo para aplicar el método Simplex</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="font-mono text-sm">
            <p className="font-medium text-green-700">{standardizedObjective}</p>
            <p className="text-muted-foreground mt-2">Sujeto a:</p>
            {standardizedConstraints.map((constraint, index) => (
              <p key={`std-${index}`} className="ml-4">
                {constraint}
              </p>
            ))}
            <p className="ml-4 text-muted-foreground">Todas las variables ≥ 0</p>
          </div>
        </CardContent>
      </Card>

      {/* Leyenda */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Leyenda de Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium mb-2">Variables Originales:</p>
              <p className="text-muted-foreground">x₁, x₂, x₃, ... = Variables de decisión del problema original</p>
            </div>
            <div>
              <p className="font-medium mb-2">Variables Añadidas:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• S₁, S₂, ... = Variables de holgura</li>
                <li>• E₁, E₂, ... = Variables de exceso</li>
                <li>• A₁, A₂, ... = Variables artificiales</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
