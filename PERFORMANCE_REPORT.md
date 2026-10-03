# パフォーマンス最適化の検証

## 対象と判断

配信対象はindex.html / css/style.css / Vanilla JavaScript。旧Next.jsのソースとビルドは本作業の対象外。セクション、文言、CSS、ロードマップ、フォーム仕様、アニメーションは変更しない。

## 実測した画像容量

HTMLから参照される重複なしPNG29点の合計（全ページ読み込み時のファイル容量）。スクロール前の通信量ではない。

| 項目 | 修正前 | 修正後 |
|---|---:|---:|
| PNG合計 | 8,866,298 bytes | 8,377,905 bytes |
| 削減量 | — | 488,393 bytes（5.51%） |

25点をPNGのまま最適化。完全透明ピクセルの不可視RGBを整理し、PNGを圧縮。透明度は全画素で維持、透明度が0より大きい画素はRGBも完全一致。寸法・表示サイズ・構図は維持。4点は小さくならず変更なし。WebP候補ではブラウザの縮小描画に微小差が出たため採用せず、追加候補ファイルも削除した。

## 読み込みと処理

初期表示のガッツポーズ素材にfetchpriority=high。COMMUNITYと最後の案内画像はloading=lazy / decoding=async。既存width/heightは維持。サイドナビは現在のセクションが変わったときだけaria-currentを更新し、同一セクション内のスクロールで不要な属性書き込みを抑制。スクロール検出・選択判定・アニメーションは維持。

## 検証

- Chromiumの320 / 390 / 768 / 1024 / 1200 / 1440pxで全ページの前後スクリーンショットを比較。全ピクセル一致、全画像decode成功、JavaScriptエラーなし。比較は同一ブラウザ・deviceScaleFactor=1・reduced-motionで実施。
- scripts/check-static.mjsを現在の確定フォーム（必須3項目）に合わせて更新。画像・中央カラム・FAQ・フォーム・メニューとEscapeを検証。
- フォーム：空欄、メール形式、同意必須、任意空欄、テスト完了の正式メッセージ、実際のPOSTなし、プライバシーダイアログを確認。
- 4ロードマップ：320〜1600pxの10幅で正式文章、切り替え、高さ、キーボード、相談内容の引き継ぎと上書き防止を確認。
- CSSとwork-roadmap.jsは変更なし。main.jsはナビの属性更新抑制のみ。JS構文検証成功。

## 未計測・未変更

本番URL・配信環境が未確定のためLighthouse、LCP/FCP/CLS/INP、実回線の表示時間は未計測。容量削減を速度スコア改善とは扱わない。キャッシュ・Brotli/Gzipはホスティング設定が必要なため未変更。Google Fontsは既存preconnect/display=swapを維持。CSSの累積上書きを整理すると適用順序にリスクがあるため維持。旧Next.jsのbuildは静的LPを検証しないため未実行。Safari/Firefoxネイティブ表示は未検証。

## 画像ファイル別

| ファイル | 前bytes | 後bytes |
|---|---:|---:|
| assets/images/logo/soul-syncs.png | 44,362 | 33,962 |
| assets/images/mascot/think-chan-cheer.png | 181,826 | 143,107 |
| assets/images/problems/01.png | 74,746 | 72,653 |
| assets/images/problems/02.png | 54,894 | 53,084 |
| assets/images/problems/03.png | 75,143 | 73,559 |
| assets/images/problems/04.png | 54,880 | 53,188 |
| assets/images/problems/05.png | 74,107 | 72,307 |
| assets/images/problems/06.png | 56,476 | 54,438 |
| assets/images/about/01_thinking.png | 321,772 | 296,052 |
| assets/images/about/02_happy.png | 349,034 | 310,245 |
| assets/images/about/03_cheer.png | 330,108 | 312,676 |
| assets/images/mascot/think-chan-bow-icon.png | 327,380 | 301,470 |
| assets/images/support/01_support_consultation.png | 1,144,433 | 1,080,923 |
| assets/images/support/02_support_workshop.png | 1,487,390 | 1,423,714 |
| assets/images/support/03_support_growth.png | 1,317,652 | 1,244,996 |
| assets/images/support/04_support_kpi_follow.png | 1,440,669 | 1,367,706 |
| assets/images/mascot/think-chan-guide.png | 187,283 | 143,588 |
| assets/images/work-options/01_choice_independence.png | 48,657 | 47,779 |
| assets/images/work-options/02_choice_creator.png | 56,343 | 55,567 |
| assets/images/work-options/03_choice_income.png | 48,934 | 48,130 |
| assets/images/work-options/04_choice_freedom.png | 62,950 | 62,580 |
| assets/images/work-options/05_step_learn.png | 31,410 | 31,091 |
| assets/images/work-options/06_step_practice.png | 32,705 | 32,456 |
| assets/images/work-options/07_step_growth.png | 38,282 | 37,821 |
| assets/images/work-options/08_step_goal.png | 28,027 | 27,978 |
