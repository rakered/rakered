import { ReactElement, ReactNode } from 'react';

function PageContent({ children }: { children: ReactNode }): ReactElement {
  return (
    <div className="flex-none bg-white shadow-md rounded-lg w-full p-8 space-y-8">
      {children}
    </div>
  );
}

function PageTitle({ children }: { children: ReactNode }): ReactElement {
  return <h2 className="text-3xl">{children}</h2>;
}

function PageFooter({ children }: { children: ReactNode }): ReactElement {
  return (
    <footer className="flex-none h-8 mt-2 text-sm text-gray-600">
      {children}
    </footer>
  );
}

function Page({ children }: { children: ReactNode }): ReactElement {
  return <>{children}</>;
}

Page.Content = PageContent;
Page.Title = PageTitle;
Page.Footer = PageFooter;

export default Page;
