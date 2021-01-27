import { createContext, ComponentChildren } from 'preact';
import { useContext } from 'preact/hooks';
import defaultTheme from './themes/default';

export const context = createContext({});

export function useTheme(prop) {
  const theme = useContext(context);
  return prop ? theme[prop] : theme;
}

const Provider = context.Provider;

export function Email({
  theme = defaultTheme,
  children,
}: {
  theme?: Record<string, any>;
  children?: ComponentChildren;
}) {
  return (
    <Provider value={theme}>
      <div style={theme.root}>{children}</div>
    </Provider>
  );
}
