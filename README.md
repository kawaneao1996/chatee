# chatee
## 概要
簡単なWEBのチャットアプリ
そして初回接続時に履歴を新規接続先のみにブロードキャストする。
以降はクライアントフォームからメッセージを受け取ったら
ブロードキャストする。

## 構成
フロントエンドはReactとtailwindCSSの予定。

~~バックエンドはRustでやったみようかな？~~

denoでやることにした。
~~まずは~~
~~[denoのチュートリアル](https://docs.deno.com/runtime/tutorials/chat_app#-primer)~~
~~をやってみる。~~

[mdnのチュートリアル](https://developer.mozilla.org/ja/docs/Web/API/WebSockets_API/Writing_a_WebSocket_server_in_JavaScript_Deno)
からDeno.serve()を使って、ブロードキャストするところから始めよう。

apiサーバーを構築するにはexpressとかoakを使うみたいだ。

いや、Deno.serve()でwebsocketができそうだ。

まず画面から作るか。
1. [ ] メッセージ表示とフォーム入力のパーツを作る。
2. [ ] アカウント名は適当につけて、ページ読み込み時にwebsocketを張る処理を書く
3. [ ] onSubmitでwebsocketにメッセージを送る処理を書く
4. [ ] サーバー側で、適当にwebsocket接続時にメッセージをブロードキャストする処理を書き、
   websocketが通じていることを確認する
5. [ ] あとはsocket.ioのチュートリアルから実装を追加する。