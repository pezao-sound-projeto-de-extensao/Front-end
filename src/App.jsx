import Navbar from './components/Navbar'
import Produtos from './pages/Produtos'
import Relatorios from './pages/Relatorios'

function App() {
  return (
    <div>
      {/* A navbar é reutilizável: cada tela passa o nome do menu ativo */}
      <Navbar active="Relatórios" />
      <Produtos />
    </div>
  )
}

export default App
