import { Suspense, useState } from 'react'
import { Outlet } from 'react-router-dom'
import * as Dialog from '@radix-ui/react-dialog'
import { Menu, X } from 'lucide-react'
import Sidebar from './Sidebar'
import LoadingSpinner from './LoadingSpinner'
import logo from '../assets/logo.png'

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-page">
      {/* Desktop: sidebar fixa */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/5 lg:block">
        <Sidebar />
      </aside>

      {/* Celular/tablet: barra no topo + gaveta */}
      <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-sidebar px-4 lg:hidden">
          <div className="flex items-center gap-2">
            <img src={logo} alt="" className="h-8 w-8 object-contain" />
            <span className="text-base font-extrabold tracking-tight text-white">Stock<span className="text-accent">Flow</span></span>
          </div>
          <Dialog.Trigger className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white" aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </Dialog.Trigger>
        </header>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 animate-fade-in bg-black/50 lg:hidden" />
          <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] shadow-[var(--shadow-modal)] focus:outline-none lg:hidden" aria-describedby={undefined}>
            <Dialog.Title className="sr-only">Menu</Dialog.Title>
            <Dialog.Close className="absolute right-3 top-4 z-10 rounded-lg p-1.5 text-sidebar-text hover:bg-white/10" aria-label="Fechar menu">
              <X className="h-5 w-5" />
            </Dialog.Close>
            <Sidebar onNavigate={() => setMenuOpen(false)} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <main className="lg:pl-64">
        <Suspense fallback={<LoadingSpinner />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
