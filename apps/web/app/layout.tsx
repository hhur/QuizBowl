import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '../src/context/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'QuizBowlHub',
  description: 'The ultimate platform for Quiz Bowl teams',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}