# サンクスページ追加

## 変更範囲

新規：thanks/index.html、css/thanks.css、assets/images/mascot/think-chan-thanks-bow.png（提供画像を無加工コピー）、scripts/check-thanks.mjs。
修正：js/main.jsの既存await submitApplication成功後に/thanksへのlocation.assignだけを追加し、遷移待ち中はボタンを無効のまま保持。失敗処理・入力検証・POST形式は変更なし。scripts/build-static.mjsにthanksのコピーを追加。netlify.tomlには/thanksを/thanks/index.htmlへ200 rewriteするルートだけ追加。

index.htmlと共通css/style.css、GAS、Netlify Functions、メール本文、担当者通知設定、フォーム項目は変更なし。新ページは共通CSSを読み込み、専用CSSはthanks-pageのみに限定。LPのmain.jsは新ページに読み込まない。

## 検証

JavaScript構文確認、静的ビルド成功。
node scripts/check-thanks.mjs：ローカルHTTPのPOST応答を模擬。必須・不正メール・未同意ではPOSTされない。失敗は入力保持・再送可・遷移なし。成功応答の完了前には遷移せず、成功後のみ/thanksへ。二重submitでもPOSTは増えない。320/375/390/430/768/1024/1200/1440pxで画像、折り返し、リロード、ホームリンク、JSエラーなしを確認。
GAS/Functions既存26テストも成功。実Netlifyの受付、GAS保存、自動返信、担当者通知は外部送信していないため未検証。Netlifyでの受付成功後のイベント処理はサーバー側で動くためブラウザ遷移による中断はしないが、サンクス表示はメール配達やシート保存完了を保証するものではない。

## 本番反映

現在動作しているGit/Netlifyの配信手順で、新規ページ・専用CSS・画像・main.js・buildのコピー追加・thanksルートを反映して再デプロイ。既存Netlify設定に独自変更がある場合はnetlify.toml全体を上書きせず、/thanksルートだけを統合する。GASとFunctionsに変更はなく、GASの再デプロイ不要。

公開/thanksの直接表示とリロード、実フォーム送信後の遷移を管理可能なテストメールで確認する。Forms保存、シート保存、自動返信、担当者通知が維持されることも確認。検証済みのローカル成功を本番成功と扱わない。
