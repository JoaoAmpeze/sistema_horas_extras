import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';

// Inicializa as coleções do banco
const dbSessions = localforage.createInstance({
  name: 'HorasExtrasApp',
  storeName: 'sessions'
});

const dbSettings = localforage.createInstance({
  name: 'HorasExtrasApp',
  storeName: 'settings'
});

/**
 * Salva uma nova sessão de horas extras
 * @param {Object} sessionData { startTime, endTime, duration, description, attachments (array de base64) }
 */
export async function saveSession(sessionData) {
  const id = uuidv4();
  const session = {
    id,
    ...sessionData,
    createdAt: new Date().toISOString()
  };
  
  await dbSessions.setItem(id, session);
  return session;
}

/**
 * Retorna todas as sessões salvas, ordenadas da mais recente para a mais antiga
 */
export async function getAllSessions() {
  const sessions = [];
  await dbSessions.iterate((value, key, iterationNumber) => {
    sessions.push(value);
  });
  
  // Ordena por data de criação descrescente
  return sessions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Deleta uma sessão específica
 * @param {string} id 
 */
export async function deleteSession(id) {
  await dbSessions.removeItem(id);
}

/**
 * Salva configurações (como preferência de nome, taxa hora, etc)
 */
export async function saveSetting(key, value) {
  await dbSettings.setItem(key, value);
}

/**
 * Recupera uma configuração
 */
export async function getSetting(key) {
  return await dbSettings.getItem(key);
}
