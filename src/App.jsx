import Navbar from './components/Navbar'
import Relatorios from './pages/Relatorios'

function App() {
  return (
    <div>
      {/* A navbar é reutilizável: cada tela passa o nome do menu ativo */}
      <Navbar active="Relatórios" />
      <Relatorios />
    </div>
  )
}

export default App
