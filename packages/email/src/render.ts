import renderToString from 'preact-render-to-string';
import { VNode } from 'preact';

export function render(vdom: VNode): string {
  return `<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title></title>
      </head>
      <body style="width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; margin:0; padding:0;">
         ${renderToString(vdom)}
      </body>
    </html>`;
}
