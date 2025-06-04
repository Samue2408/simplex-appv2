import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface SimplexTableauProps {
  tableau: {
    matrix: number[][]
    basicVariables: string[]
    nonBasicVariables: string[]
    pivotRow?: number
    pivotCol?: number
    enteringVar?: string
    leavingVar?: string
    pivotElement?: number
  }
}

export function SimplexTableau({ tableau }: SimplexTableauProps) {
  const { matrix, basicVariables, nonBasicVariables, pivotRow, pivotCol } = tableau

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24 bg-[#f1f5f9]">Base</TableHead>
            {nonBasicVariables.map((variable, index) => (
              <TableHead
                key={`header-${index}`}
                className={
                  index === pivotCol
                    ? "bg-yellow-100 font-bold"
                    : index === nonBasicVariables.length - 1
                      ? "bg-blue-100"
                      : ""
                }
              >
                {variable}
                {index === pivotCol && tableau.enteringVar && (
                  <span className="block text-xs text-green-600">(Entrante)</span>
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {matrix.map((row, rowIndex) => (
            <TableRow key={`row-${rowIndex}`} className={rowIndex === pivotRow ? "bg-yellow-50" : ""}>
              <TableCell className={`font-medium ${rowIndex === pivotRow ? "bg-yellow-100" : "bg-[#f1f5f9]"}`}>
                {basicVariables[rowIndex]}
                {rowIndex === pivotRow && tableau.leavingVar && (
                  <span className="block text-xs text-red-600">(Saliente)</span>
                )}
              </TableCell>
              {row.map((cell, cellIndex) => (
                <TableCell
                  key={`cell-${rowIndex}-${cellIndex}`}
                  className={`
                    ${rowIndex === pivotRow && cellIndex === pivotCol ? "bg-green-200 font-bold" : ""}
                    ${rowIndex === pivotRow ? "bg-yellow-50" : ""}
                    ${cellIndex === pivotCol ? "bg-yellow-50" : ""}
                    ${cellIndex === row.length - 1 ? "bg-blue-50" : ""}
                  `}
                >
                  {cell.toFixed(2)}
                  {rowIndex === pivotRow && cellIndex === pivotCol && (
                    <span className="block text-xs text-purple-600">(Pivote)</span>
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
