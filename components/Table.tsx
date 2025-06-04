type Props = {
  matrix: number[][];
  iteration: number;
};

export default function Table({ matrix, iteration }: Props) {
  return (
    <div className="mt-6">
      <h2 className="font-semibold">Iteración {iteration}</h2>
      <table className="table-auto border-collapse border border-gray-400 mt-2">
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="border border-gray-400 px-2 py-1 text-sm text-center">
                  {cell.toFixed(2)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
