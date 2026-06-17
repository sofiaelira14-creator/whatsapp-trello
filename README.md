# WhatsApp → Trello

Automação que transforma mensagens do WhatsApp em cards no Trello.

**Formato da mensagem:**
```
Morumbi: Revisar contrato do apartamento
Will: Agendar reunião de alinhamento
Upskill: Preparar material da aula de quinta
Sofia: Comprar presente de aniversário
Mackenzie: Entregar trabalho de processos gráficos
```

---

## Passo a passo de instalação

### 1. Instalar o Node.js
Acessa https://nodejs.org e baixa a versão LTS (botão verde grande).
Instala normalmente como qualquer programa.

### 2. Baixar e instalar o projeto
Abre o Terminal (no Mac: CMD + Espaço → "Terminal") ou Prompt de Comando (no Windows).

```bash
# Entra na pasta do projeto
cd whatsapp-trello

# Instala as dependências
npm install
```

### 3. Subir o servidor no Railway (gratuito)

1. Acessa https://railway.app
2. Cria conta com o Google
3. Clica em **"New Project"** → **"Deploy from GitHub repo"**
   - Se ainda não conectou o GitHub, clica em "Deploy from local" e faz upload da pasta
4. Sobe a pasta `whatsapp-trello` inteira
5. Railway detecta automaticamente que é Node.js e sobe o servidor
6. Na aba **"Settings"** → **"Networking"** → clica em **"Generate Domain"**
7. Copia a URL gerada (ex: `https://whatsapp-trello-production.up.railway.app`)

> Alternativa mais simples para testes: instala o ngrok (https://ngrok.com),
> roda `node index.js` localmente e depois `ngrok http 3000`.
> O ngrok gera uma URL pública temporária.

### 4. Instalar a Evolution API

A Evolution API é o que conecta seu WhatsApp Business ao servidor.

**Opção fácil — usar o serviço hospedado:**
1. Acessa https://evolution-api.com
2. Cria uma conta gratuita
3. Cria uma nova instância
4. Escaneia o QR Code com seu WhatsApp Business
5. Anota a URL da instância e o API Key gerados

**Opção técnica — rodar localmente com Docker:**
```bash
docker run -d \
  -p 8080:8080 \
  --name evolution-api \
  atendai/evolution-api:latest
```
Depois acessa http://localhost:8080 para configurar.

### 5. Configurar o Webhook na Evolution API

No painel da Evolution API, vai em **Configurações** → **Webhook** e preenche:

- **URL:** `https://SUA-URL-DO-RAILWAY.up.railway.app/webhook`
- **Eventos:** marcar apenas `messages.upsert`
- Salva

### 6. Pegar o ID do grupo

1. Abre o WhatsApp Business no celular
2. Entra no grupo (o grupo só com você)
3. Clica nos três pontinhos → **Info do grupo**
4. Procura o "Link de convite" — o ID do grupo está nele
   Ex: `chat.whatsapp.com/AbCd1234XYZ` → o ID é `AbCd1234XYZ`

Ou, mais fácil: manda qualquer mensagem no grupo e olha os logs do servidor.
O `remoteJid` que aparecer no console é o ID completo do grupo.

### 7. Adicionar o ID do grupo no Railway

No Railway, vai em **Variables** e adiciona:
```
GRUPO_ID = 120363XXXXXXXX@g.us
```
(o ID do grupo sempre termina com `@g.us`)

---

## Testando

Manda uma mensagem no grupo:
```
Sofia: Testar a automação
```

Deve aparecer um card na lista "sofia" do seu Trello em segundos.

---

## Áreas disponíveis

| Mensagem começa com | Lista no Trello |
|---------------------|----------------|
| `Morumbi:`          | morumbi        |
| `Will:`             | will           |
| `Upskill:`          | upskill        |
| `Sofia:`            | sofia          |
| `Mackenzie:`        | mackenzie      |

> Não diferencia maiúsculas/minúsculas. "MORUMBI:", "morumbi:" e "Morumbi:" funcionam igual.
> Acentos também são ignorados.

---

## Dúvidas comuns

**Mandei a mensagem mas não criou o card**
- Verifica se o servidor está rodando (acessa a URL no navegador, deve mostrar `{"status":"rodando"}`)
- Confirma que o webhook está configurado com a URL correta
- Olha os logs no Railway para ver o que chegou

**Quero adicionar uma área nova**
Abre o `index.js`, vai na seção `LISTAS` e adiciona:
```js
novaarea: 'ID_DA_LISTA_NO_TRELLO',
```
O ID da lista você pega na URL da API:
`https://api.trello.com/1/boards/450Dpdme/lists?key=SUA_KEY&token=SEU_TOKEN`
