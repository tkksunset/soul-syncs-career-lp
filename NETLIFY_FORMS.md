# Netlify Formsの本番接続

静的配信用index.htmlのcareer-consultationをNetlify Formsへ接続。旧Next.jsのbuildはこの静的LPを出力しないため使用しない。index.html / css / js / assetsを含むZIPを静的サイトとして再デプロイする。フォーム検出が有効でも、このHTMLの再デプロイ前はフォームは登録されない。

## 実装

name=career-consultation、method=POST、data-netlify=true、netlify-honeypot=bot-field。form-nameをhiddenで保持。項目名はname / email / message / privacyConsent。bot-fieldは非表示。JavaScriptでURLSearchParamsを用いてapplication/x-www-form-urlencodedとして同一サイトの/へPOST。2xx時のみ指定の完了表示。失敗時は指定エラーと入力保持、ボタン復帰。既存のrequired/メール/同意検証とロードマップの引き継ぎは維持。

入力・ボタン・フォント・CSS・画像は変更なし。本番受付と矛盾するデモ注意書きは撤去。フォーム成功表示はHTTP成功の確認であり、個々の受付の管理画面保存はデプロイ後に確認する。通知・自動返信・外部連携は未実装。

## 検証

node --check js/main.js成功。node scripts/check-netlify-form.mjsでローカルHTTP・模擬POST応答を使い、320/390/768/1024/1200/1440px、未入力・不正メール・未同意、正式フィールド、任意空欄、honeypot、送信中無効化、二重送信防止、成功・失敗・再送信・入力保持、ロードマップ連携を確認。実際の個人情報のNetlify送信は行っていない。静的HTMLなのでビルド不要。管理画面上のフォーム検出・保存は未検証。

## 再デプロイ後の確認

1. 最新ZIPを展開してNetlifyの静的公開ルートへデプロイ（index.htmlがルート）。旧Next.jsを自動ビルドする設定なら静的配信に合わせる必要がある。
2. Formsにcareer-consultationが表示されていることを確認。
3. フォーム詳細でhoneypot設定を確認。
4. テスト名・管理可能なテストメールで公開LPから送信。
5. FormsのVerified submissions（必要に応じてSpam）でname/email/message/privacyConsentを確認。検証後のテスト投稿は管理画面で整理する。
6. 未入力と未同意では送信されないことを公開環境でも確認。

Netlify側の権限・公開URL・保存状態はこの作業では確認していない。通知設定は次工程。サーバー側の厳密な同意強制・独自検証が必要になった場合は、別途Netlify Functions等の検討が必要（今回は追加しない）。
