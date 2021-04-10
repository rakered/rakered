import { ReactElement, ReactNode } from 'react';
import { useRouter } from 'next/router';

interface LinkProps {
  children?: ReactNode;
  tabIndex?: number;
  href: string;
}

const line = (
  <div
    className="absolute left-0 w-full py-px transition transform translate-x-50 scale-x-0 group-hover:bg-current group-hover:scale-x-100 group-hover:translate-x-0 group-focus:bg-current group-focus:scale-100 group-focus:translate-x-0"
    style={{
      bottom: -2,
    }}
  />
);
// We don't use next/link, to reduce the number of dependencies on Next. This way,
// we can extract 90% of this package later, and turn this into a simple wrapper
// arround something like @rakered/accounts-ui
function Link({ children, href, tabIndex }: LinkProps): ReactElement {
  const router = useRouter();

  return (
    <a
      data-rakered-link
      className="group cursor-pointer text-blue-600 outline-none relative"
      tabIndex={tabIndex}
      onClick={(event) => {
        event.preventDefault();
        router.push(href);
        return false;
      }}
    >
      {children}
      {line}
    </a>
  );
}

export default Link;
