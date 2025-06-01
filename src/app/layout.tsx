import './globals.css'
import localFont from 'next/font/local'
import { GoogleAnalytics } from '@next/third-parties/google'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import SessionWrapper from '@/components/SessionWrapper';

const polysansBold = localFont({ 
  src: '../../public/fonts/PolySans Bulky.woff'
})

const polysansMedian = localFont({ 
  src: '../../public/fonts/PolySans Median.woff'
})

const polysansNeutral = localFont({ 
  src: '../../public/fonts/PolySans Neutral.woff'
})

const polysansSlim = localFont({ 
  src: '../../public/fonts/PolySans Slim.woff'
})

export const metadata = {
  title: 'Schoolwave',
  description: 'Empowering Education, Automating & Simplifying Administration',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${polysansBold.className} ${polysansMedian.className} ${polysansNeutral.className} ${polysansSlim.className}`}>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <SessionWrapper>
            {children}
          </SessionWrapper>
        </AppRouterCacheProvider>
      </body>
      <GoogleAnalytics gaId="G-QEGB02XXMJ" />
    </html>
  )
}
