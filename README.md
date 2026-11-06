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

## Tab "Bộ thủ 214"

- **📖 bảng 214**: 214 bộ thủ chia theo số nét (tên Hán Việt, nghĩa, dạng biến thể như 亻 氵 扌), che tên / nghĩa / bộ để tự kiểm tra, đánh dấu ★ đã thuộc, bấm ô để xem cách viết
- **🧠 luyện nhớ**: gõ tên Hán Việt (không dấu cũng được) · chọn nghĩa · chọn bộ · mix; bộ trả lời sai sẽ được hỏi lại sau vài câu; cuối lượt có "luyện lại bộ sai"
- **✍ luyện viết**: xem từng nét chạy theo đúng thứ tự (có tên nét: ngang, sổ, phẩy, mác…) · tập viết theo nét mờ · viết theo trí nhớ không gợi ý. Vẽ bằng chuột hoặc cảm ứng, app chấm từng nét (đúng hình, đúng chiều, đúng thứ tự) và gợi ý khi sai nhiều lần
- Lọc theo số nét (chọn nhiều nhóm cùng lúc), "❗ hay sai", "☆ chưa thuộc"; tiến độ lưu trong trình duyệt

## Tab "Lục thư" (六書)

Hiểu kanji được tạo ra như thế nào: 象形 tượng hình · 指事 chỉ sự · 会意 hội ý · 形声 hình thanh · 転注 chuyển chú · 仮借 giả tá.

- **📘 học 6 loại**: định nghĩa, cách nhận biết, ví dụ bấm được (công thức ghép bộ, nghĩa gốc)
- **🧩 họ âm 形声**: các chữ chung một phần chỉ âm nên cùng âm On (青 → 清 晴 請 情 精 …), có che âm / che nghĩa để tự kiểm tra
- **🧱 bộ gợi nghĩa**: mỗi bộ thủ báo hiệu nhóm nghĩa nào (氵 nước, 扌 tay, 言 lời nói…), kèm các chữ ví dụ
- **🧠 luyện tập**: phân loại chữ · gõ romaji đoán âm On từ các chữ cùng họ âm · chọn bộ gợi nghĩa · ghép nghĩa các phần của chữ hội ý; câu sai được hỏi lại

`data/rikusho.js` do tôi biên soạn tay (không lấy từ trang web nào), sửa trực tiếp được. Một số chữ có nhiều cách phân tích (đặc biệt 転注), nên coi đây là cách giải thích phổ biến để dễ nhớ chứ không phải kết luận duy nhất.

## Dữ liệu

`data/minna.js` được trích từ https://riki.edu.vn/minna-no-nihongo/bai-1 … bai-25 (từ vựng, ngữ pháp, câu ví dụ).
Hán Việt của kanji được thêm tay. Có thể sửa trực tiếp file này (`v`: `[kana, kanji, nghĩa]`, `g`: mẫu câu + ví dụ).

`data/botthu.js`: danh sách 214 bộ thủ, Hán Việt và nghĩa lấy từ https://kohi.vn/blog/tron-bo-214-bo-thu-trong-tieng-nhat-m5iot (đã sửa vài ký tự lỗi trên trang gốc: 丨, 骨). Thứ tự nét viết lấy từ [KanjiVG](http://kanjivg.tagaini.net) © Ulrich Apel, giấy phép CC BY-SA 3.0. Bộ 辵 được tập ở dạng 辶. Số nét hiển thị khi viết là số nét thật của chữ trong KanjiVG nên vài bộ (瓜 臣 韋) hơn 1 nét so với bảng Khang Hy.

Lưu ý: danh sách từ vựng của Riki ở các bài sau (14–15, 18–25) không đầy đủ so với giáo trình, nên số từ ít hơn.
