const express = require('express');
const app = express();
app.use(express.json());

// ─── CONFIGURAÇÕES ───────────────────────────────────────────────
const TRELLO_KEY   = '3847a54a8dbec46469fe25b91b79297b';
const TRELLO_TOKEN = 'ATTA905bcb93c7aed5bb69718db2340a31df62e782816856cd56e4174856eae9468f9CD900C7';

// IDs das listas do seu board (capturados automaticamente)
const LISTAS = {
  morumbi:   '6a27655ba538ef44b4f78ca4',
  will:      '6a27655ba538ef44b4f78ca5',
  upskill:   '6a2765f3cc39e319b57c160f',
  sofia:     '6a27662861a5bd7ea1b6e765',
  mackenzie: '6a27655ba538ef44b4f78ca3',
};

// Número do grupo (você preenche depois — instruções no README)
const GRUPO_ID = process.env.GRUPO_ID || '';
// ─────────────────────────────────────────────────────────────────

// Parseia a mensagem no formato "Área: Tarefa"
function parsearMensagem(texto) {
  if (!texto || typeof texto !== 'string') return null;

  const match = texto.match(/^([^:]+):\s*(.+)$/s);
  if (!match) return null;

  const area  = match[1].trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const tarefa = match[2].trim();

  if (!LISTAS[area]) return null;

  return { area, idLista: LISTAS[area], tarefa };
}

// Cria card no Trello
async function criarCard(idLista, nome) {
  const url = `https://api.trello.com/1/cards?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idList: idLista, name: nome }),
  });

  if (!res.ok) {
    const erro = await res.text();
    throw new Error(`Trello API erro ${res.status}: ${erro}`);
  }

  return res.json();
}

// Webhook recebido da Evolution API
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    // Ignora eventos que não são mensagens
    if (body.event !== 'messages.upsert') return res.sendStatus(200);

    const msg = body.data?.messages?.[0];
    if (!msg) return res.sendStatus(200);

    const remoteJid = msg.key?.remoteJid || '';
    const fromMe    = msg.key?.fromMe;
    const texto     = msg.message?.conversation
                   || msg.message?.extendedTextMessage?.text
                   || '';

    // Só processa mensagens do grupo configurado
    if (GRUPO_ID && !remoteJid.includes(GRUPO_ID)) return res.sendStatus(200);

    // Ignora mensagens enviadas pelo próprio Business (fromMe = true)
    // Se quiser aceitar dos dois lados, remova esta linha:
    if (fromMe) return res.sendStatus(200);

    console.log(`[MENSAGEM] de ${remoteJid}: ${texto}`);

    const parsed = parsearMensagem(texto);
    if (!parsed) {
      console.log(`[IGNORADO] formato não reconhecido: "${texto}"`);
      return res.sendStatus(200);
    }

    const card = await criarCard(parsed.idLista, parsed.tarefa);
    console.log(`[TRELLO] Card criado em "${parsed.area}": ${card.shortUrl}`);

    return res.sendStatus(200);

  } catch (err) {
    console.error('[ERRO]', err.message);
    return res.sendStatus(500);
  }
});

// Rota de teste
app.get('/', (req, res) => {
  res.json({ status: 'rodando', listas: Object.keys(LISTAS) });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
