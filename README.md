# monkey-type-jp (KanaType)

Luyện gõ romaji → hiragana / katakana, đoạn văn, và **Minna no Nihongo bài 1–25**.

Chạy: mở `index.html`, hoặc `python -m http.server` rồi vào http://localhost:8000.

## Tab "Minna 1–25"

- **Loại**: từ vựng · kanji (từ có kanji + Hán Việt) · ngữ pháp (câu ví dụ của từng mẫu câu)
- **📚 chọn bài**: bật/tắt từng bài hoặc theo cụm 1–5, 6–10…
- **🙈 ghi nhớ**: ẩn kana, chỉ còn gợi ý (nghĩa / kanji) — gõ romaji từ trí nhớ, `space` để xem đáp án
- **Thứ tự**: ngẫu nhiên · tuần tự (nhớ vị trí đã học) · ưu tiên mục hay sai
- **📖 xem bảng**: bảng từ vựng/kanji/ngữ pháp, có che kana/nghĩa/kanji để tự kiểm tra
- Cuối lượt: danh sách mục đã ôn, mục sai nằm trên cùng, nút "luyện lại mục sai"

## Dữ liệu

`data/minna.js` được trích từ https://riki.edu.vn/minna-no-nihongo/bai-1 … bai-25 (từ vựng, ngữ pháp, câu ví dụ).
Hán Việt của kanji được thêm tay. Có thể sửa trực tiếp file này (`v`: `[kana, kanji, nghĩa]`, `g`: mẫu câu + ví dụ).

Lưu ý: danh sách từ vựng của Riki ở các bài sau (14–15, 18–25) không đầy đủ so với giáo trình, nên số từ ít hơn.
