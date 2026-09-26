import { renderInline } from "./Inline";

export function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="glass thin-scroll overflow-x-auto !rounded-[18px]">
      <table className="w-full text-left text-[14.5px]">
        <thead>
          <tr className="border-b border-separator">
            {head.map((h, i) => (
              <th key={i} className="px-4 py-3 text-xs font-semibold tracking-wider text-label-2 uppercase">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-separator/60 last:border-0">
              {r.map((c, j) => (
                <td key={j} className="px-4 py-2.5 align-top">
                  {renderInline(c, `${i}-${j}`)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
