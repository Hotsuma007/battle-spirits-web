const labels = {
  BATALHA: "対戦", CONFIRMADA: "開始決定", PARTIDA: "対戦", NORMAL: "通常対戦", ENCONTRADA: "相手が見つかりました",
  CRIAR: "ルームを", SALA: "作成", "ENTRAR EM": "ルームに", "TIPO DE": "対戦方法を", "READY CHECK": "開始確認", PUBLIC: "公開", PRIVATE: "非公開",
  VOCÊ: "自分", OPONENTE: "相手", AGUARDANDO: "待機中", CONECTADO: "接続中", DESCONECTADO: "未接続", ERRO: "接続エラー", OFFLINE: "オフライン", PRONTO: "準備完了", CONFIRMANDO: "確認中", BUSCANDO: "検索中", ESPERA: "待機中",
  RANK: "ランク", STATUS: "状態", PLAYER: "プレイヤー", "SEM DETALHES": "詳細なし",
  "Decks bloqueados no servidor": "デッキが確定しました", "A partida começará automaticamente": "対戦が自動的に始まります",
  "Os dois jogadores estão prontos": "両プレイヤーが参加しています", "Aguardando o segundo jogador": "相手の参加を待っています",
  "O criador da sala inicia a partida": "ルームの作成者が対戦を開始します", "Copiar código da sala": "ルームコードをコピー", "Sair desta tela e desconectar": "画面を閉じて切断します",
  "Confirme antes do tempo acabar": "制限時間内に確認してください", "Procurando adversário...": "対戦相手を探しています…",
  "Conectar usando código da sala": "ルームコードを使って参加", "Matchmaking rápido": "対戦相手を自動で探します", "Pública, privada ou protegida por senha": "公開・非公開やパスワードを設定", "Use um código de convite": "招待コードを使って参加",
  "Escolha um deck.": "デッキを選択してください。", "Este deck precisa estar válido no formato Eternal.": "エターナルで使用できるデッキを選択してください。",
  "Aguarde a conexão Online.": "オンライン接続をお待ちください。", "Digite o código da sala.": "ルームコードを入力してください。", "Entre na sua conta para desafiar amigos.": "フレンドに対戦を申し込むにはログインしてください。",
  "A busca foi interrompida.": "対戦相手の検索が中断されました。", "O desafio foi encerrado.": "対戦の申し込みが終了しました。", "Não foi possível iniciar a busca.": "対戦相手の検索を開始できませんでした。",
  "A confirmação da partida expirou.": "対戦開始の確認期限が切れました。", "Não foi possível enviar o desafio.": "対戦を申し込めませんでした。", "Não foi possível aceitar o desafio.": "対戦の申し込みを受けられませんでした。",
  "Não foi possível criar a sala.": "ルームを作成できませんでした。", "Não foi possível entrar na sala.": "ルームに参加できませんでした。", "Não foi possível iniciar a partida.": "対戦を開始できませんでした。",
  "Procurando outro jogador...": "対戦相手を探しています…", "Partida encontrada. Confirme para continuar.": "対戦相手が見つかりました。開始を確認してください。", "Partida confirmada.": "対戦開始を確認しました。",
  "Desafio enviado. Aguardando resposta do amigo...": "対戦を申し込みました。フレンドの返答を待っています…", "Desafio aceito.": "対戦の申し込みを受け付けました。",
  "Nenhum deck": "デッキなし", "Deck adversário": "相手のデッキ", "Buscando jogador": "対戦相手を検索中", "Aguardando conexão": "接続を待っています",
  "conectado · identidade pública": "接続中・公開プロフィール", offline: "オフライン", "partida encontrada · deck protegido": "対戦相手が見つかりました・デッキは非公開", "o deck será revelado apenas quando permitido": "デッキは公開可能になった時点で表示されます"
};

export function japaneseMatchSetupText(value) {
  if (typeof value !== "string") return value;
  if (labels[value]) return labels[value];
  const connection = value.match(/^ONLINE · (CONECTADO|DESCONECTADO|ERRO)$/);
  if (connection) return `オンライン・${labels[connection[1]]}`;
  const room = value.match(/^ONLINE 1V1 · SALA (.+)$/);
  if (room) return `オンライン対戦・ルーム ${room[1]}`;
  const footers = {
    "ONLINE 1V1 · VS": "オンライン対戦・対戦開始",
    "ONLINE 1V1 · READY CHECK": "オンライン対戦・開始確認",
    "ONLINE 1V1 · MATCHMAKING EM ANDAMENTO": "オンライン対戦・対戦相手を検索中",
    "ONLINE 1V1 · MATCHMAKING, SALAS PRIVADAS E CÓDIGO": "オンライン対戦・ルームコードで参加"
  };
  return footers[value] || value;
}
