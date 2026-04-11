const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Carrega a service account do secret do GitHub
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();

// Detecta qual horário disparou o workflow
const schedule = process.env.GITHUB_EVENT_SCHEDULE || '';

let titulo = '';
let mensagem = '';

if (schedule === '0 11 * * *') {
  // 08:00 Brasília
  titulo = '🛒 Bom dia!';
  mensagem = 'Confira o checklist de abertura';
} else if (schedule === '0 21 * * *') {
  // 18:00 Brasília
  titulo = '☀️ Lembrete do turno da tarde!';
  mensagem = 'Não esqueça de conferir o checklist!';
} else {
  // Rodou manualmente (workflow_dispatch) — usa o da manhã como padrão
  titulo = '🛒 Bom dia!';
  mensagem = 'Confira o checklist de abertura';
}

async function enviarLembrete() {
  try {
    const docId = 'pendente_' + Date.now();
    await db.collection('fcm_envios').doc(docId).set({
      storeId: 'todas', // envia para todas as lojas
      titulo,
      mensagem,
      criadoEm: Date.now(),
      status: 'pendente'
    });

    console.log(`✅ Lembrete enfileirado com sucesso!`);
    console.log(`   Título: ${titulo}`);
    console.log(`   Mensagem: ${mensagem}`);
    console.log(`   Doc ID: ${docId}`);
  } catch (err) {
    console.error('❌ Erro ao enfileirar lembrete:', err);
    process.exit(1);
  }
}

enviarLembrete();
