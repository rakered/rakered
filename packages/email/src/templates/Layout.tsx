import { ReactNode, CSSProperties } from 'react';

const styles: Record<string, CSSProperties> = {
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
};

function ensureArray(arr) {
  return Array.isArray(arr) ? arr : [arr].filter(Boolean);
}

interface CellProps {
  children?: ReactNode;
  style?: Record<string, string>;
  className?: string;
  colSpan?: number;
}

function Cell({ children, style = {}, className, colSpan }: CellProps) {
  return (
    <td colSpan={colSpan} style={style} className={className}>
      {children}
    </td>
  );
}

function Row({ children, style = {} }) {
  const content = ensureArray(children)
    .filter(Boolean)
    .map((el, idx, { length }) => {
      if (el.type === Cell) {
        return el;
      }

      return (
        <Cell key={idx} colSpan={length === 1 ? 12 : undefined}>
          {el}
        </Cell>
      );
    });

  return <tr style={style}>{content}</tr>;
}

function Grid({ children, style = {} }) {
  const content = ensureArray(children)
    .filter(Boolean)
    .map((el, idx) => {
      if (!el) {
        return null;
      }

      // We want this content the be on it's own row.
      if (el.type === Row) {
        return el;
      }

      // The content is all inside a single cell (so a row)
      if (el.type === Cell) {
        return <Row key={idx}>{el}</Row>;
      }

      // The content is one cell inside it's own row
      return (
        <Row key={idx}>
          <Cell colSpan={12}>{el}</Cell>
        </Row>
      );
    })
    .filter(Boolean);

  return (
    <table
      cellPadding={0}
      cellSpacing={0}
      style={{ ...styles.table, ...style }}
    >
      <tbody>{content}</tbody>
    </table>
  );
}

Grid.Row = Row;
Grid.Cell = Cell;

export { Grid, Row, Cell };
