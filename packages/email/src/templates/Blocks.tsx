import { useTheme } from './Email';
import { Grid } from './Layout';

export function Paragraph({ children }) {
  const style = useTheme('paragraph');

  return <div style={style}>{children}</div>;
}

export function CallToAction({ href, children }) {
  const style = useTheme('callToAction');

  return (
    <div style={style.outer}>
      <a href={href} style={style.inner}>
        {children}
      </a>
    </div>
  );
}

export function Content({ children }) {
  const style = useTheme('content');

  return (
    <div style={style.outer}>
      <div style={style.inner}>
        <Grid>{children}</Grid>
      </div>
    </div>
  );
}

export function Title({ children }) {
  const style = useTheme('title');
  return <div style={style}>{children}</div>;
}

export function Code({ children }) {
  const style = useTheme('code');

  return (
    <div style={style.outer}>
      <div style={style.inner}>{children}</div>
    </div>
  );
}

export function Header({
  logo,
  action,
}: {
  logo?: string;
  action?: { label: string; url: string };
}) {
  const style = useTheme('header');

  return (
    <div style={style.outer}>
      <div style={style.inner}>
        {logo ? <img style={style.logo} src={logo} /> : null}

        {action ? (
          <a href={action.url} style={style.button}>
            {action.label}
          </a>
        ) : null}
      </div>
    </div>
  );
}

export function Footer({ children }) {
  const style = useTheme('footer');

  return (
    <div style={style.outer}>
      <div style={style.inner}>{children}</div>
    </div>
  );
}
