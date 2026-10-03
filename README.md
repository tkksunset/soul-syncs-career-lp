# Soul Sync’s キャリア支援LP

無料キャリア設計への申し込みを目的とする、HTML / CSS / Vanilla JavaScriptの静的サイトです。公開作業は行っていません。既存のNext.jsファイルは以前の実装として残していますが、この静的サイトの動作・公開には不要です。

## ローカル確認

`index.html`をブラウザで直接開けます。Google Fontsの読み込みにはインターネット接続が必要です。未接続時には標準フォントで表示します。

HTTPで確認する場合は、このディレクトリで `python3 -m http.server 8080` を実行し、`http://localhost:8080` を開いてください。

## 静的サイトのディレクトリ構成

```
index.html
css/style.css
js/main.js
assets/images/logo/soul-syncs.png
assets/images/mascot/think-chan-front.jpg
assets/images/mascot/think-chan-wave.png
assets/images/support/1.webp〜4.webp
assets/images/work/1.webp〜4.webp
assets/images/icons/
assets/images/decoration/
assets/favicon/favicon.svg
README.md
.gitignore
```

## 素材と画像差し替え

正式ロゴは添付画像12、正式シンクちゃんは添付画像13を変更せずコピーしています。シンクちゃんはSECTION 01・06・10のみ使用。PC右側もこれらのセクションが表示中の場合のみ出現します。新しいポーズや類似キャラクターは生成していません。

support・workの写真は、今回のカンプの文字を含まない写真部分を切り出した仮素材です。カンプ全体・カード・見出しを画像として表示していません。正式写真がある場合は同名ファイルで差し替えるか、index.htmlのsrcとaltを変更してください。切り出し元に独立写真の高解像度素材がないため、画角・解像度には制限があります。

## テキスト・デザイン変更

文章はすべてindex.html内にあります。見出し、本文、FAQ回答、フォームラベルを直接変更できます。色・角丸・影・余白・中央幅・ヘッダー高さはcss/style.css冒頭のCSS Variablesで管理します。中央カラムは430px、SP左右余白は24pxです。サイド要素は1200px未満で非表示です。

カンプに未掲載のFAQ回答は、カンプ本文・依頼内容に基づく仮原稿です。オンライン対応等の正式な運用内容に合わせて確認・更新してください。

## フォーム送信先変更

現在はデモです。送信・保存は行わず、完了状態もデモと表示します。

1. index.htmlのformの `data-endpoint=""` に送信先URLを指定。
2. js/main.jsのfetch処理を受信APIに合わせて変更。現在はPOST / JSON形式です。Formspree、GAS、Supabase等の仕様に応じてContent-Typeやペイロードを調整してください。
3. 受信側でCORS、必須チェック、レート制限などを実装。秘密鍵をフロントエンドに記載しないでください。
4. 正式送信を確認してから、HTMLのdemo-noticeとプライバシーダイアログの仮文言を更新。

送信失敗時は入力内容を保持します。必須、年齢、メール、国内電話番号（ハイフン・空白・括弧可）、同意を検証します。検証は受信側でも行ってください。

## GitHubへ保存

既存リポジトリで、静的サイトに必要なファイルだけを追加する例：

```
git add index.html css js assets README.md .gitignore
git commit -m "Add Soul Sync career support static landing page"
git push origin HEAD
```

新規Repositoryの場合はGitHubで空のRepositoryを作成し、ローカルでgit init後にremoteを登録してpushしてください。この作業ではcommit・pushは実行していません。

## 公開方法の候補

静的ファイル一式をサーバーの公開ディレクトリへアップロードできます。GitHub Pagesは公開ブランチのルート、Netlifyはビルドコマンドなし・公開ディレクトリを静的ファイルのルート、VercelはFramework PresetをOtherに設定する方法が候補です。既存Next.jsファイルの自動検出を避けるため、公開用Repositoryには上記静的サイトファイルだけを入れてください。

公開前にcanonical・OGPのexample.com、favicon仮素材、正式プライバシーポリシー、フォームAPI、写真・FAQ原稿を差し替えます。公開手続きは今回行っていません。

## アクセシビリティ・動作

FAQはQ1のみ初期表示、複数項目を独立して開閉できます。メニューはEscapeで閉じます。ポリシーはネイティブdialog、フォームはlabel・aria-describedby・エラー通知・送信状態を使用。動きを減らすOS設定に対応しています。Google Fonts以外の外部依存はありません。

## FV正式素材の更新

FVは提供された `01_手を振る.png` を元ファイルと同一のまま `assets/images/mascot/think-chan-wave.png` にコピーして使用しています。拡大切り抜き・色合成・変形はありません。正式ロゴは引き続き `assets/images/logo/soul-syncs.png` を使用します。他セクションの画像参照は変更していません。

## FV背景装飾

独立した透過PNG: `assets/images/decoration/hero-decoration.png`。
淡い光・オレンジの曲線・抽象装飾のみ。文字・ロゴ・CTA・キャラクターは含みません。
組み込みimage_genで生成しました。生成指示:「透過背景の縦長装飾素材。端に淡いピーチ色の光、右上・左下から細いオレンジ曲線、控えめな抽象円。中央・左上に広い透明領域。#F2380B / #FF6B42 / #FFF0E8。文字・数字・ロゴ・人物・動物・キャラクター・CTA・UIなし。」

CSSの `.hero::before` だけで背景を表示します。HTMLコンテンツは変更していません。
`.hero` の変数 `--hero-decoration-image`（画像）、`--hero-decoration-size`（サイズ）、`--hero-decoration-position`（位置）、`--hero-decoration-opacity`（濃さ）で調整可能です。
スマホはcover / center、768px以上は110% auto / center top。トリミングはCSSで行い、元画像は変更しません。
装飾はCSS背景なので読み上げ・フォーカス対象にならず、pointer-events:noneでリンク等の操作を妨げません。

## PC左右サイドカラムの改修

1200px以上で固定表示。中央メインは430px・画面中央を維持。低い画面では左右それぞれ内部スクロールが可能です。1200px未満では非表示で、既存スマホメニューを使用します。
右キャラクターは最新の正式提供素材 `05_ガッツポーズ.png` を加工せず `assets/images/mascot/think-chan-cheer.png` にコピー。今回の指定により、PC右カラムは全セクションで表示します（以前の01・06・10のみの表示制限から変更）。中央コンテンツ内のキャラクターは変更していません。
SNS正式URLは `js/main.js` の `SOCIAL_URLS`（x / instagram / youtube / note）に設定してください。未設定時は「URL準備中」の無効ボタン、httpsの正式URL設定後は新しいタブで開くリンクになります。仮のURLは使っていません。

## FVキャラクターの全身素材への差し替え

FVは最新の正式素材 `01_手を振る.png` を加工せず `assets/images/mascot/think-chan-wave-full.png` にコピーして使用。元の胸元までの画像から全身素材へ差し替え、顔・耳・足先まで表示しています。右サイドのガッツポーズは変更していません。

## 最新FV（「自分らしさ」から、未来をつくろう。）

見出し・本文・CTAを最新原稿に変更。1200px以上は中央FVのキャラクターを非表示、右カラムのみ表示。1200px未満は右サイドを非表示にし、FV本文の下に同一の正式ガッツポーズ素材 `assets/images/mascot/think-chan-cheer.png` を表示します。画像ファイルは共用で、非表示側はdisplay:none。中央の他セクションは従来のままです。
最新FVの背景はCSSグラデーション・曲線・朝日の装飾で構成し、以前の独立背景PNGは現在のFVからは参照していません。320/390/768/1024/1199/1200/1440pxで見出し・表示切り替え・横スクロールなしを確認。ChromiumでFAQ・デモフォーム・メニューも確認済みです。

## 総合ブラッシュアップ

最新の改善・検証・運用確認が必要な項目は `QA_REPORT.md` を参照してください。フォーム送信先と必須項目は変更していません。現在も送信先未設定の場合はデモです。
