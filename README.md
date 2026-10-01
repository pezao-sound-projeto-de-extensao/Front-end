# StockFlow · Front-end

Interface web do **StockFlow**, sistema de gestão de estoque da **Pezão Sound** (loja de som automotivo). É um projeto de extensão.

Com ela, a equipe da loja controla produtos e movimentações de estoque, cria orçamentos, acompanha encomendas, consulta relatórios e gerencia usuários e permissões. Tudo isso conversando com a API do back-end.

## Tecnologias

React, Vite, Tailwind CSS, React Router e Axios.

## Como rodar

Você precisa de Node.js 20+ e do back-end rodando.

```bash
npm ci
cp .env.example .env   # preencha VITE_API_BASE_URL com a URL do back-end
npm run dev
```

## Docker

```bash
docker build -t pezao-sound-web .
docker run -p 8080:80 -e VITE_API_BASE_URL=https://url-da-api pezao-sound-web
```
