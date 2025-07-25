import React from 'react';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html style={{ background: 'white' }}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          html, body {
            background: white !important;
            background-image: none !important;
            background-color: white !important;
          }
          :root {
            --background-start-rgb: 255, 255, 255;
            --background-end-rgb: 255, 255, 255;
          }
        `}} />
      </head>
      <body style={{ background: 'white' }}>
        {children}
      </body>
    </html>
  );
}
