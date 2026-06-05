import { useState } from 'react'
import './Relatorios.css'

/* ======================================================================
   DADOS DE EXEMPLO
   Por enquanto é tudo "chumbado" (estático). Quando o backend estiver
   pronto, é só trocar esses arrays/objetos pelos dados que vierem da API.
   ====================================================================== */

// Os 4 cartões de resumo do topo
const resumo = {
  totalEstoque: 48,
  produtosOk: 39,
  emAlerta: 6,
  zerados: 3,
}

// Tabela "Produtos com estoque crítico"
const produtosCriticos = [
  { produto: 'Cabo P10 Mono 3m', qtd: 0, minimo: 10, status: 'Zerado' },
  { produto: 'Bateria 9V Alcalina', qtd: 0, minimo: 12, status: 'Zerado' },
  { produto: 'Palheta Fender Medium', qtd: 5, minimo: 15, status: 'Baixo' },
  { produto: 'LED Strip 5m RGB', qtd: 8, minimo: 15, status: 'Baixo' },
]

// Lista "Produtos mais movimentados"
const maisMovimentados = [
  { produto: 'Cabo P10 Mono 3m', qtd: 45 },
  { produto: 'Microfone Shure SM58', qtd: 32 },
  { produto: 'LED Strip 5m RGB', qtd: 28 },
  { produto: 'Corda Violão 0.10', qtd: 24 },
  { produto: 'Bateria 9V Alcalina', qtd: 15 },
]

// Tabela "Histórico completo" (já vem do mais recente para o mais antigo)
const historico = [
  { data: '24/03/2026', produto: 'Cabo P10 Mono 3m', categoria: 'Acessórios elétricos', tipo: 'Entrada', qtd: 10, antes: 5, depois: 15, obs: 'Compra fornecedor ABC, NF 1234' },
  { data: '23/03/2026', produto: 'Microfone Shure SM58', categoria: 'Som automotivo', tipo: 'Saída', qtd: 2, antes: 10, depois: 8, obs: 'Venda cliente Maria' },
  { data: '22/03/2026', produto: 'Pedal Distortion Boss DS-1', categoria: 'Som automotivo', tipo: 'Entrada', qtd: 5, antes: 7, depois: 12, obs: '—' },
  { data: '21/03/2026', produto: 'Corda Violão 0.10', categoria: 'Acessórios elétricos', tipo: 'Saída', qtd: 3, antes: 28, depois: 25, obs: 'Venda loja física' },
  { data: '20/03/2026', produto: 'LED Strip 5m RGB', categoria: 'Iluminação', tipo: 'Entrada', qtd: 10, antes: 8, depois: 18, obs: 'Reposição de estoque' },
  { data: '19/03/2026', produto: 'Bateria 9V Alcalina', categoria: 'Baterias', tipo: 'Saída', qtd: 5, antes: 5, depois: 0, obs: '—' },
]

// Opções do filtro de categoria
const categorias = ['Todas', 'Acessórios elétricos', 'Som automotivo', 'Iluminação', 'Baterias']

/* ======================================================================
   FUNÇÕES AUXILIARES
   ====================================================================== */

// Deixa a data no formato que o <input type="date"> entende: aaaa-mm-dd
function formatarData(data) {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return ano + '-' + mes + '-' + dia
}

// Escolhe a cor da barra conforme o volume de movimentação
function corDaBarra(qtd) {
  if (qtd >= 30) return 'azul'
  if (qtd >= 20) return 'laranja'
  return 'vermelho'
}

/* ======================================================================
   COMPONENTE DA TELA
   ====================================================================== */

function Relatorios() {
  // Estados dos campos do filtro
  const [periodo, setPeriodo] = useState('Este mês')
  const [dataInicio, setDataInicio] = useState('2026-06-01')
  const [dataFim, setDataFim] = useState('2026-06-05')
  const [categoria, setCategoria] = useState('Todas')

  // Categoria que já foi "aplicada" (só muda quando clica em Aplicar)
  const [categoriaAplicada, setCategoriaAplicada] = useState('Todas')

  // Quando troca o período, preenche as datas automaticamente
  function aoMudarPeriodo(evento) {
    const valor = evento.target.value
    setPeriodo(valor)

    const hoje = new Date()
    let inicio = hoje

    if (valor === 'Hoje') {
      inicio = hoje
    } else if (valor === 'Esta semana') {
      inicio = new Date()
      inicio.setDate(hoje.getDate() - 7)
    } else if (valor === 'Este mês') {
      inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    }

    // No "Personalizado" deixamos o usuário escolher as datas na mão
    if (valor !== 'Personalizado') {
      setDataInicio(formatarData(inicio))
      setDataFim(formatarData(hoje))
    }
  }

  // Botão "Aplicar": atualiza o histórico de acordo com a categoria escolhida
  function aplicarFiltros() {
    setCategoriaAplicada(categoria)
  }

  // Botões de imprimir / exportar (o navegador permite salvar como PDF)
  function imprimir() {
    window.print()
  }

  // Histórico já filtrado pela categoria aplicada
  const historicoFiltrado =
    categoriaAplicada === 'Todas'
      ? historico
      : historico.filter((item) => item.categoria === categoriaAplicada)

  // Quantos produtos estão zerados (para o selo ao lado do título)
  const quantidadeZerados = produtosCriticos.filter((p) => p.status === 'Zerado').length

  // Maior valor da lista de movimentados (serve para calcular o tamanho das barras)
  const maiorMovimentacao = Math.max(...maisMovimentados.map((p) => p.qtd))

  return (
    <div className="pagina">
      {/* Cabeçalho */}
      <div className="cabecalho">
        <h1 className="titulo">Relatórios</h1>
        <div className="acoes">
          <button className="botao-secundario" onClick={imprimir}>🖨 Imprimir</button>
          <button className="botao-secundario" onClick={imprimir}>📄 Exportar PDF</button>
        </div>
      </div>

      {/* Card de filtros */}
      <div className="filtro-card">
        <div className="filtro-campo">
          <label>PERÍODO</label>
          <select value={periodo} onChange={aoMudarPeriodo}>
            <option>Hoje</option>
            <option>Esta semana</option>
            <option>Este mês</option>
            <option>Personalizado</option>
          </select>
        </div>

        <div className="filtro-campo">
          <label>DE</label>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </div>

        <div className="filtro-campo">
          <label>ATÉ</label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </div>

        <div className="filtro-campo">
          <label>CATEGORIA</label>
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            {categorias.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <button className="botao-aplicar" onClick={aplicarFiltros}>Aplicar</button>
      </div>

      {/* 4 cartões de resumo */}
      <div className="cards-resumo">
        <div className="card">
          <p className="card-label">TOTAL EM ESTOQUE</p>
          <p className="card-numero">{resumo.totalEstoque}</p>
          <p className="card-sub">produtos diferentes</p>
        </div>
        <div className="card">
          <p className="card-label">PRODUTOS OK</p>
          <p className="card-numero verde">{resumo.produtosOk}</p>
          <p className="card-sub">dentro do mínimo</p>
        </div>
        <div className="card">
          <p className="card-label">PRODUTOS EM ALERTA</p>
          <p className="card-numero laranja">{resumo.emAlerta}</p>
          <p className="card-sub">abaixo do mínimo</p>
        </div>
        <div className="card">
          <p className="card-label">PRODUTOS ZERADOS</p>
          <p className="card-numero vermelho">{resumo.zerados}</p>
          <p className="card-sub">sem estoque</p>
        </div>
      </div>

      {/* Duas seções lado a lado */}
      <div className="duas-colunas">
        {/* Seção 1: estoque crítico */}
        <div className="bloco">
          <div className="bloco-titulo">
            <h2>Produtos com estoque crítico</h2>
            <span className="selo-zerados">{quantidadeZerados} zerados</span>
          </div>

          <table className="tabela">
            <thead>
              <tr>
                <th>PRODUTO</th>
                <th>QTD</th>
                <th>MÍNIMO</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {produtosCriticos.map((p) => (
                <tr key={p.produto}>
                  <td>{p.produto}</td>
                  <td>{p.qtd}</td>
                  <td>{p.minimo}</td>
                  <td>
                    <span className={p.status === 'Zerado' ? 'badge badge-zerado' : 'badge badge-baixo'}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Seção 2: mais movimentados */}
        <div className="bloco">
          <div className="bloco-titulo">
            <h2>Produtos mais movimentados</h2>
            <span className="rotulo-mes">este mês</span>
          </div>

          <div className="lista-movimentados">
            {maisMovimentados.map((p) => (
              <div className="linha-movimentado" key={p.produto}>
                <div className="linha-topo">
                  <span>{p.produto}</span>
                  <span className="linha-qtd">{p.qtd}</span>
                </div>
                <div className="barra-fundo">
                  <div
                    className={'barra ' + corDaBarra(p.qtd)}
                    style={{ width: (p.qtd / maiorMovimentacao) * 100 + '%' }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Seção 3: histórico completo */}
      <div className="bloco">
        <div className="bloco-titulo">
          <h2>Histórico completo de movimentações no período</h2>
          <div className="acoes">
            <button className="botao-secundario" onClick={imprimir}>🖨 Imprimir</button>
            <button className="botao-secundario" onClick={imprimir}>📄 Exportar PDF</button>
          </div>
        </div>

        <table className="tabela">
          <thead>
            <tr>
              <th>DATA</th>
              <th>PRODUTO</th>
              <th>CATEGORIA</th>
              <th>TIPO</th>
              <th>QUANTIDADE</th>
              <th>ESTOQUE ANTES</th>
              <th>ESTOQUE DEPOIS</th>
              <th>OBSERVAÇÃO</th>
            </tr>
          </thead>
          <tbody>
            {historicoFiltrado.map((m, indice) => (
              <tr key={indice}>
                <td>{m.data}</td>
                <td>{m.produto}</td>
                <td>{m.categoria}</td>
                <td>
                  {m.tipo === 'Entrada' ? (
                    <span className="badge badge-entrada">+ Entrada</span>
                  ) : (
                    <span className="badge badge-saida">− Saída</span>
                  )}
                </td>
                <td className={m.tipo === 'Entrada' ? 'qtd-entrada' : 'qtd-saida'}>
                  {m.tipo === 'Entrada' ? '+' + m.qtd : '−' + m.qtd}
                </td>
                <td>{m.antes}</td>
                <td>{m.depois}</td>
                <td>{m.obs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Relatorios
