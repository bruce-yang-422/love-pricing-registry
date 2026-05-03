# 戀愛實價登錄

《戀愛實價登錄》是一部台灣都市諷刺小說。這個資料夾包含小說 Markdown 章節，以及一個可直接部署到 GitHub Pages 的單頁閱讀器。

## 前端網址

https://bruce-yang-422.github.io/love-pricing-registry/

## 線上閱讀器

入口檔案是 `index.html`。

閱讀器功能：

- 章節目錄
- 章節搜尋
- 上一章 / 下一章
- 閱讀進度條
- 字體大小調整
- 日間 / 夜間模式
- 自動記住上次閱讀章節

目前前端只顯示正文第 01 到第 12 章；`00-戀愛實價登錄-設定集.md` 和 `99-戀愛實價登錄-行銷上市企劃.md` 不會出現在讀者目錄中。

## 檔案結構

```text
.
├── index.html
├── README.md
├── ch01-估價-歡迎登入戀愛實價系統.md
├── ch02-帶看-物件有瑕疵-需配合議價.md
├── ...
├── ch12-退訂-毀約的勇氣與真正的入住.md
├── 00-戀愛實價登錄-設定集.md
└── 99-戀愛實價登錄-行銷上市企劃.md
```

## 本機預覽

因為 `index.html` 會用 `fetch` 載入 Markdown 檔案，建議用本機 HTTP server 預覽，不要直接雙擊開檔。

在專案資料夾執行：

```bash
python -m http.server 8000
```

然後開啟：

```text
http://127.0.0.1:8000/index.html
```

## 部署到 GitHub Pages

1. 建立 GitHub repository。
2. 將本資料夾內的檔案推上 repository。
3. 到 GitHub repository 的 `Settings`。
4. 打開 `Pages`。
5. Source 選擇 `Deploy from a branch`。
6. Branch 選擇 `main`，資料夾選擇 `/root`。
7. 儲存後等待 GitHub Pages 部署完成。

部署完成後，GitHub 會提供一個網址，通常格式如下：

```text
https://你的帳號.github.io/你的-repo-名稱/
```

## 新增或調整章節

如果要新增章節，需要：

1. 新增對應的 `.md` 檔案。
2. 打開 `index.html`。
3. 在 `chapters` 陣列中加入章節資料。

格式範例：

```js
{ no: "13", title: "新章標題", file: "ch13-新章標題.md" }
```

## 授權

文字與程式碼授權狀態未指定。若要公開發布或開放他人使用，建議補上明確授權條款。
