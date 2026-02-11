# Worker Mailer

[English](./README.md) | [Português](./README_pt-BR.md)

[![npm version](https://badge.fury.io/js/worker-mailer.svg)](https://badge.fury.io/js/worker-mailer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Worker Mailer é um cliente SMTP que roda em Cloudflare Workers. Utiliza [Cloudflare TCP Sockets](https://developers.cloudflare.com/workers/runtime-apis/tcp-sockets/) e não depende de nenhuma biblioteca externa.

## Funcionalidades

- 🚀 Totalmente baseado no runtime do Cloudflare Workers, sem dependências externas
- 📝 Suporte completo a tipos TypeScript
- 📧 Suporte a envio de emails em texto puro e HTML com anexos
- 🔒 Suporte a múltiplos métodos de autenticação SMTP: `plain`, `login` e `CRAM-MD5`
- 📅 Suporte a DSN (Delivery Status Notification)

## Índice

- [Instalação](#instalação)
- [Início Rápido](#início-rápido)
- [Referência da API](#referência-da-api)
- [Limitações](#limitações)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

## Instalação

```shell
npm i worker-mailer
```

## Início Rápido

1. Configure seu `wrangler.toml`:

```toml
compatibility_flags = ["nodejs_compat"]
# ou compatibility_flags = ["nodejs_compat_v2"]
```

2. Use no seu código:

```typescript
import { WorkerMailer } from 'worker-mailer'

// Conectar ao servidor SMTP
const mailer = await WorkerMailer.connect({
  credentials: {
    username: 'bob@acme.com',
    password: 'password',
  },
  authType: 'plain',
  host: 'smtp.acme.com',
  port: 587,
  secure: true,
})

// Enviar email
await mailer.send({
  from: { name: 'Bob', email: 'bob@acme.com' },
  to: { name: 'Alice', email: 'alice@acme.com' },
  subject: 'Olá do Worker Mailer',
  text: 'Esta é uma mensagem em texto puro',
  html: '<h1>Olá</h1><p>Esta é uma mensagem HTML</p>',
})
```

3. Usando com frameworks JavaScript modernos (Next.js, Nuxt, SvelteKit, etc.)

Ao trabalhar com frameworks que usam Node.js como runtime de desenvolvimento, você precisará lidar com o fato de que APIs específicas do Cloudflare Workers (como `cloudflare:sockets`) não estão disponíveis durante o desenvolvimento local.

A abordagem recomendada é usar imports dinâmicos condicionais. Aqui está um exemplo para Nuxt.js:

```typescript
export default defineEventHandler(async event => {
  // Verificar se está rodando em ambiente de desenvolvimento
  if (import.meta.dev) {
    // Desenvolvimento: Usar nodemailer (ou qualquer biblioteca de email compatível com Node.js)
    const nodemailer = await import('nodemailer')
    const transporter = nodemailer.default.createTransport()
    return await transporter.sendMail()
  } else {
    // Produção: Usar worker-mailer no ambiente Cloudflare Workers
    const { WorkerMailer } = await import('worker-mailer')
    const mailer = await WorkerMailer.connect()
    return await mailer.send()
  }
})
```

Este padrão garante que sua aplicação funcione perfeitamente em ambos os ambientes de desenvolvimento e produção.

## Referência da API

### WorkerMailer.connect(options)

Cria uma nova conexão SMTP.

```typescript
type WorkerMailerOptions = {
  host: string // Hostname do servidor SMTP
  port: number // Porta do servidor SMTP (geralmente 587 ou 465)
  secure?: boolean // Usar TLS (padrão: false)
  startTls?: boolean // Atualizar para TLS se o servidor SMTP suportar (padrão: true)
  credentials?: {
    // Credenciais de autenticação SMTP
    username: string
    password: string
  }
  authType?:
    | 'plain'
    | 'login'
    | 'cram-md5'
    | Array<'plain' | 'login' | 'cram-md5'>
  logLevel?: LogLevel // Nível de log (padrão: LogLevel.INFO)
  socketTimeoutMs?: number // Timeout do socket (milissegundos)
  responseTimeoutMs?: number // Timeout de resposta do servidor (milissegundos)
}
```

### mailer.send(options)

Envia um email.

```typescript
type EmailOptions = {
  from:
    | string
    | {
        // Email do remetente
        name?: string
        email: string
      }
  to:
    | string
    | string[]
    | {
        // Destinatários
        name?: string
        email: string
      }
    | Array<{ name?: string; email: string }>
  reply?:
    | string
    | {
        // Endereço de resposta
        name?: string
        email: string
      }
  cc?:
    | string
    | string[]
    | {
        // Destinatários em cópia
        name?: string
        email: string
      }
    | Array<{ name?: string; email: string }>
  bcc?:
    | string
    | string[]
    | {
        // Destinatários em cópia oculta
        name?: string
        email: string
      }
    | Array<{ name?: string; email: string }>
  subject: string // Assunto do email
  text?: string // Conteúdo em texto puro
  html?: string // Conteúdo HTML
  headers?: Record<string, string> // Cabeçalhos personalizados
  attachments?: { filename: string; content: string; mimeType?: string }[] // Anexos
}
```

### Método Estático: WorkerMailer.send()

Envia um único email sem manter a conexão.

```typescript
await WorkerMailer.send(
  {
    // WorkerMailerOptions
    host: 'smtp.acme.com',
    port: 587,
    credentials: {
      username: 'user',
      password: 'pass',
    },
  },
  {
    // EmailOptions
    from: 'remetente@acme.com',
    to: 'destinatario@acme.com',
    subject: 'Teste',
    text: 'Olá',
  },
)
```

## Limitações

- **Restrição de Porta:** Cloudflare Workers não permite conexões de saída na porta 25. Você não pode enviar emails pela porta 25, mas as portas principais 587 e 465 são suportadas.
- **Limite de Conexões:** Cada instância do Worker tem um limite de conexões TCP simultâneas. Certifique-se de fechar as conexões corretamente após o uso.

## Contribuindo

Contribuições da comunidade são bem-vindas! Aqui estão as diretrizes para contribuir:

### Configuração do Ambiente de Desenvolvimento

1. Faça um fork e clone o repositório
2. Instale as dependências:
   ```bash
   pnpm install
   ```
3. Crie uma nova branch para sua feature/correção:
   ```bash
   git checkout -b feature/nome-da-sua-feature
   ```

### Testes

1. Testes unitários:
   ```bash
   npm test
   ```
2. Testes de integração:
   ```bash
   pnpm dlx wrangler dev ./test/worker.ts
   ```
   Então, envie uma requisição POST para `http://127.0.0.1:8787` com o seguinte corpo JSON:
   ```json
   {
     "config": {
       "credentials": {
         "username": "xxx@xx.com",
         "password": "xxxx"
       },
       "authType": "plain",
       "host": "smtp.acme.com",
       "port": 587,
       "secure": false,
       "startTls": true
     },
     "email": {
       "from": "xxx@xx.com",
       "to": "yyy@yy.com",
       "subject": "Email de Teste",
       "text": "Olá Mundo"
     }
   }
   ```

### Processo de Pull Request

> Para mudanças significativas, por favor abra uma issue primeiro para discutir o que você gostaria de mudar.

1. Atualize a documentação para refletir quaisquer mudanças
2. Adicione ou atualize testes conforme necessário
3. Certifique-se de que todos os testes passam
4. Atualize o changelog se aplicável
5. Envie o pull request com uma descrição clara das suas mudanças

### Reportando Problemas

Ao reportar problemas, por favor inclua:

- Uma descrição clara do problema
- Passos para reproduzir o problema
- Comportamento esperado vs comportamento real
- Versão do worker-mailer que você está usando
- Quaisquer trechos de código relevantes ou mensagens de erro

## Licença

Este projeto está licenciado sob a Licença MIT.
