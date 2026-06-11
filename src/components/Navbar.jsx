import './Navbar.css'

// Navbar reutilizavel.
// Cada tela usa assim:  <Navbar active="Relatórios" />
// O nome passado em "active" fica destacado no menu.
function Navbar({ active }) {
  // Itens do menu. Para adicionar uma pagina nova, e so colocar o nome aqui.
  const itens = [
    'Dashboard',
    'Produtos',
    'Movimentações',
    'Orçamentos',
    'Encomendas',
    'Relatórios',
    'Usuários',
  ]

  // Data de hoje escrita por extenso, ex: "sexta-feira, 5 de junho de 2026"
  const dataDeHoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <header className="navbar">
      <div className="navbar-logo">
        <span className="navbar-nota">♫</span> Pezão <span className="navbar-azul">Sound</span>
      </div>

      <nav className="navbar-menu">
        {itens.map((item) => (
          <a
            key={item}
            href="#"
            className={item === active ? 'navbar-item ativo' : 'navbar-item'}
          >
            {item}
          </a>
        ))}
      </nav>

      <div className="navbar-direita">
        <span className="navbar-data">{dataDeHoje}</span>
        <a href="#" className="navbar-sair">⇥ Sair</a>
      </div>
    </header>
  )
}

export default Navbar
