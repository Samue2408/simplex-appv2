// SimplexTable.tsx
import React from "react"

interface Props {
  tableau: number[][]
  variables: string[]
  steps: string[]
  optimalValue: number
  status: string
}

export const SimplexTable: React.FC<Props> = ({ tableau, variables, steps, optimalValue, status }) => {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Resultado del Simplex</h2>
      <p className="text-sm text-gray-700">Estado: <strong>{status}</strong></p>
      <p className="text-sm">Valor &oacute;ptimo: <strong>{optimalValue}</strong></p>

      <div className="overflow-auto">
        <table className="table-auto border border-collapse">
          <thead>
            <tr>
              <th className="border px-2 py-1">Base</th>
              {variables.map((v, i) => (
                <th key={i} className="border px-2 py-1">{v}</th>
              ))}
              <th className="border px-2 py-1">RHS</th>
            </tr>
          </thead>
          <tbody>
            {tableau.map((row, i) => (
              <tr key={i}>
                <td className="border px-2 py-1">{i === tableau.length - 1 ? 'Z' : variables[i] || '-'}</td>
                {row.map((val, j) => (
                  <td key={j} className="border px-2 py-1">{val.toFixed(2)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="font-semibold mt-4 mb-2">Pasos:</h3>
        <ol className="list-decimal pl-5 text-sm space-y-1">
          {steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  )
}
