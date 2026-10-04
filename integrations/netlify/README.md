# Netlify Forms → Functions → GAS → スプレッドシート

## 実装と受付ID

netlify/functions/submission-created.mjsはNetlify公式の継続サポートされるlegacy event function。formSubmittedの公開型がdataのみのため、受付IDが取得可能なsubmission-createdのpayload.idを使用。payload.form_name（またはdata['form-name']）がcareer-consultationの受付だけを処理。IDがなければMISSING_REQUIRED_DATAとして失敗し、ランダムIDや個人情報のハッシュで代用しない。外部HTTP Webhook通知は追加しない。

送信JSONは{id, data:{name,email,message}}。URLSearchParamsでkeyにWEBHOOK_SECRETを設定し、JSONをGASへPOST。GASのContentServiceリダイレクトはHTTPSのGoogle指定ホストだけ許可し、302/303後はGET。OKとAlready registeredだけを成功とする。HTTP 2xxでもその他の本文は失敗。既存LPのHTML/CSS/JS/画像/フォームとメール通知設定は変更しない。

## 環境変数

Netlify Project configuration → Environment variablesで以下を登録。
- GAS_WEB_APP_URL：既存のhttps://script.google.com/macros/s/.../exec。secretをURLに埋めて保存せず、コードがkeyを追加する。
- WEBHOOK_SECRET：GAS Script Propertiesと同じ値。

Functionsスコープ・productionコンテキストで設定し、変更後は再デプロイ。NEXT_PUBLIC_等のブラウザ公開名にしない。実値をGitHub・設定ファイル・ログに書かない。

## GAS全文と更新

integrations/gas/Code.gsが置き換え用の全文。現在の実コード全体は未提供のため、ほかの関数がある場合はそれを保持し、doPostをこの実装へ統合する。
GASのプロジェクト設定 → スクリプトプロパティにWEBHOOK_SECRETとSPREADSHEET_ID（Google Sheets URLの/d/と/editの間）を設定。シート「キャリア設計申込者管理」の1行目は既存ヘッダー、A〜J列を維持。ScriptLockの中でA列ID確認→追記→flush。再送時はAlready registered。ユーザー入力の数式実行を抑制。B列は既存JSONに受付時刻がないためGASが最初に受信した日時で、Netlifyの厳密な受付日時ではない。GASのタイムゾーンをAsia/Tokyoへ設定する。
既存のデプロイを編集し、新バージョンに更新して同じWebアプリURLを維持。実行ユーザーはシート編集権限のある所有者、アクセスはNetlifyから認証画面なしで到達できる設定にする。URL上は公開でも保存はkey認証を通過したもののみ。

## GitHub・Netlifyデプロイ

1. このプロジェクトにはGit remoteが未設定のためpush未実施。実際の公開LPリポジトリを確認し、LP本体は今回変更せず、新規netlify/、integrations/、netlify.toml、scripts/build-static.mjs、.gitignoreの追記だけを反映する。
2. netlify.tomlは静的LPをdistへコピーするbuildとFunctionsを設定。既存Netlify管理画面のBase directoryがリポジトリルートであることを確認。旧Next.jsアプリをビルドする設定を使わず、Framework presetは静的サイトとして扱う。既存に別の設定がある場合はFunctions設定と静的出力を統合し、上書きしない。
3. Git連携のデプロイを実行。Functionsにsubmission-createdがあること、LPのフォーム検出と表示が維持されていることを確認。
4. 通常の静的ZIPのドラッグ＆ドロップではFunctionのビルドは完了しない。GitビルドまたはNetlify CLIのbuild/deployを使う。ZIP内のサーバーコードを公開ディレクトリに置かない。publish=distはHTML/CSS/JS/assetsのみで秘密やGASコードを含まない。

## ログと復旧

ログはcomponentと固定codeのみ。氏名・メール・message・key・URL・GAS応答本文・生例外を出さない。
SAVED / ALREADY_REGISTERED / CONFIG_ERROR / INVALID_EVENT / MISSING_REQUIRED_DATA / GAS_AUTH_ERROR / GAS_INVALID_DATA / GAS_STORAGE_ERROR / GAS_HTTP_ERROR / GAS_REDIRECT_ERROR / GAS_TIMEOUT / GAS_NETWORK_ERROR / GAS_UNEXPECTED_RESPONSEを区別。
失敗はFunctionが500を返す。Netlify Formsの受付と担当者メールを取り消さない。Netlifyの自動再試行回数・保証を仮定しない。失敗時はFormsに保存済みの同じ受付IDと同じデータを使って再処理する。新しくフォームを送信して復旧すると別受付になるため、復旧方法として使わない。保存後に通信が切れた場合も同じIDで再処理すれば重複しない。

## 検証結果と本番テスト

node scripts/build-static.mjs成功。node --test integrations/netlify/*.test.mjs integrations/gas/gas.test.mjsで18テスト成功（GAS通信は模擬、GASサービスはVM内モック）。認証、必須データ、成功/重複、エラー本文、リダイレクト、他フォーム除外、安定ID、ロック中の重複防止、列数、数式保護を確認。index.html/css/js/assetsは変更なし。Netlifyの関数ビルド、実行・イベントの実payload、GASの実権限・シート保存・同時実行は本番未検証。

1. Netlifyにデプロイ・GASに新バージョン公開後、管理可能なメールアドレスで実際の公開LPから申し込む。
2. Formsの保存と既存担当者メールを確認。
3. FunctionsのSAVEDログ、シートのA列IDがNetlifyの受付IDと一致すること、C〜Eの内容、F未対応、G〜J空欄を確認。
4. 同じ受付イベントを再処理し、ALREADY_REGISTERED、行が増えないことを確認（検証用NodeスクリプトからsyncSubmissionを呼ぶ場合もサーバー専用環境とし、データをコミット/ログ出力しない）。
5. 非本番サイトでsecret不一致、通信失敗、GAS保存失敗を確認し、成功として記録されないことを確認。
6. 上記完了後だけ、Forms → Submission notificationsで停止済みの旧GAS宛HTTP POST通知を削除。担当者メール通知は残す。新しいHTTP POST通知を追加する必要はない。

## 公式資料

https://docs.netlify.com/build/functions/trigger-on-events/ （legacy conventionとプラットフォーム署名検証）
https://github.com/netlify/open-api （submissionのid / form_name / data）
https://developers.google.com/apps-script/reference/content/content-service
https://developers.google.com/apps-script/reference/lock/lock-service

### 失敗した受付の手動再処理

scripts/replay-submission.mjsを、GAS_WEB_APP_URLとWEBHOOK_SECRETをサーバー専用環境に設定したNode環境で実行できる。stdinのJSONは既存受付のpayload（id、form_name、data）または{payload:...}。受付IDをFormsの元IDから変えない。個人情報を含むJSONをリポジトリ外の保護された一時ファイルに保存し、`node scripts/replay-submission.mjs < /保護された場所/受付.json`として実行。終わったら一時ファイルを削除。秘密をコマンド行へ直接記載しない。
