/*
 * BATTLE SPIRITS ETERNAL SIMULATOR v3
 * CONFIGURAÇÃO DO ONLINE
 *
 * Para trocar o servidor, altere SOMENTE o valor de serverUrl abaixo.
 * Este arquivo é carregado em tempo de execução: não precisa recompilar o site.
 */
window.BATTLE_SPIRITS_ONLINE_CONFIG = {
  serverUrl: "http://127.0.0.1:3001",
  healthPath: "/health",
  connectionTimeoutMs: 10000,
  transports: ["websocket", "polling"]
};
