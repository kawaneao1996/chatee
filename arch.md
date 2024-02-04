# チャット機能の設計

## メッセージの構造

- サーバーからクライアントに送るメッセージの構造
  `{messageID:string, userName:string, message:string}`
- クライアントからサーバーに送るメッセージの構造
  `{timeStamp:string, userID:string, message:string}`

### 補足

メッセージのIDはサーバーで付与する。
まず

## サーバー側の処理

```mermaid
sequenceDiagram
  participant Server as サーバー
  participant Client as クライアント

  Client->>Server: 接続要求
  Server->>Server: 接続を確立
  Server-->>Client: 接続確認
  Server-->>Client: 初期表示メッセージ送信※１

  loop メッセージ送信ループ
    Client->>Server: メッセージ送信※２
    Server-->>Client: メッセージ受信※３
  end

  loop ping送信ループ
    Client->>Server: ping
    Server-->>Client: pong
  end

  Client->>Server: 接続終了要求
  Server-->>Client: 接続終了確認
  Server->>Server: 接続を終了
```

**※１** 初期表示メッセージでは直近の３０件を送信する
**※２** メッセージ送信のレスポンスで付与されたIDを取得する
**※３** メッセージ受信


## クライアント側の処理
