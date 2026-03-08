import { motion } from "framer-motion";

interface ComparisonItem {
  label: string;
  values: string[];
}

interface ComparisonTableProps {
  title: string;
  headers: string[];
  rows: ComparisonItem[];
}

const ComparisonTable = ({ title, headers, rows }: ComparisonTableProps) => (
  <div className="k8s-card overflow-hidden">
    <h3 className="font-display font-semibold text-lg text-foreground mb-4">{title}</h3>
    <div className="overflow-x-auto -mx-6 -mb-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {headers.map((h, i) => (
              <th key={i} className="px-6 py-3 text-left font-display font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <motion.tr
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors"
            >
              <td className="px-6 py-3 font-medium text-foreground">{row.label}</td>
              {row.values.map((v, j) => (
                <td key={j} className="px-6 py-3 text-muted-foreground">{v}</td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default ComparisonTable;
