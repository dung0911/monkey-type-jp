/* Ngày · tháng · thứ trong tiếng Nhật — dữ liệu cho tab "Ngày tháng" (js/ngay.js). Sửa tay được.
   r: các cách đọc chấp nhận (kana). Cách đọc đầu tiên là cách đọc chuẩn, hiển thị làm đáp án. */
const NGAY={
 intro:'Ngày trong tháng (～日) khó nhất: 1–10, 14, 20, 24 đọc theo cách riêng (đuôi か), còn lại là số + にち. Tháng (～月) dễ hơn nhưng có 3 bẫy: 4月 し · 7月 しち · 9月 く. Thứ (～曜日) nhớ theo 7 yếu tố: nhật · nguyệt · hỏa · thủy · mộc · kim · thổ.',
 days:[
  {n:1,r:['ついたち'],tip:'ついたち — ngày đầu tháng, hoàn toàn khác quy luật.'},
  {n:2,r:['ふつか'],tip:'ふつか — ふた = hai.'},
  {n:3,r:['みっか'],tip:'みっか — み = ba, っ đôi chữ k.'},
  {n:4,r:['よっか'],tip:'よっか — よ = bốn (KHÔNG đọc よんにち).',trap:1},
  {n:5,r:['いつか'],tip:'いつか — いつ = năm.'},
  {n:6,r:['むいか'],tip:'むいか — む = sáu.'},
  {n:7,r:['なのか'],tip:'なのか — なな = bảy.'},
  {n:8,r:['ようか'],tip:'ようか — や/よう = tám.'},
  {n:9,r:['ここのか'],tip:'ここのか — ここの = chín.'},
  {n:10,r:['とおか'],tip:'とおか — とお = mười (nhớ: とお, không phải とう).'},
  {n:11,r:['じゅういちにち'],tip:'Từ 11 trở đi: số + にち.'},
  {n:12,r:['じゅうににち']},
  {n:13,r:['じゅうさんにち']},
  {n:14,r:['じゅうよっか'],tip:'じゅう + よっか (giống 4日) — KHÔNG đọc じゅうよんにち.',trap:1},
  {n:15,r:['じゅうごにち']},
  {n:16,r:['じゅうろくにち']},
  {n:17,r:['じゅうしちにち','じゅうななにち'],tip:'しち (thường dùng) hoặc なな đều được.',trap:1},
  {n:18,r:['じゅうはちにち']},
  {n:19,r:['じゅうくにち'],tip:'く chứ không phải きゅう.',trap:1},
  {n:20,r:['はつか'],tip:'はつか — ngoại lệ, đọc riêng hoàn toàn.',trap:1},
  {n:21,r:['にじゅういちにち']},
  {n:22,r:['にじゅうににち']},
  {n:23,r:['にじゅうさんにち']},
  {n:24,r:['にじゅうよっか'],tip:'にじゅう + よっか (giống 4日).',trap:1},
  {n:25,r:['にじゅうごにち']},
  {n:26,r:['にじゅうろくにち']},
  {n:27,r:['にじゅうしちにち','にじゅうななにち'],tip:'しち (thường dùng) hoặc なな đều được.',trap:1},
  {n:28,r:['にじゅうはちにち']},
  {n:29,r:['にじゅうくにち'],tip:'く chứ không phải きゅう.',trap:1},
  {n:30,r:['さんじゅうにち']},
  {n:31,r:['さんじゅういちにち']}
 ],
 months:[
  {n:1,r:['いちがつ']},{n:2,r:['にがつ']},{n:3,r:['さんがつ']},
  {n:4,r:['しがつ'],tip:'し (không đọc よん).',trap:1},
  {n:5,r:['ごがつ']},{n:6,r:['ろくがつ']},
  {n:7,r:['しちがつ'],tip:'しち (không đọc なな).',trap:1},
  {n:8,r:['はちがつ']},
  {n:9,r:['くがつ'],tip:'く (không đọc きゅう).',trap:1},
  {n:10,r:['じゅうがつ']},{n:11,r:['じゅういちがつ']},{n:12,r:['じゅうにがつ']}
 ],
 weeks:[
  {k:'日曜日',vi:'Chủ nhật',r:['にちようび'],tip:'日 mặt trời'},
  {k:'月曜日',vi:'Thứ Hai',r:['げつようび'],tip:'月 mặt trăng'},
  {k:'火曜日',vi:'Thứ Ba',r:['かようび'],tip:'火 lửa'},
  {k:'水曜日',vi:'Thứ Tư',r:['すいようび'],tip:'水 nước'},
  {k:'木曜日',vi:'Thứ Năm',r:['もくようび'],tip:'木 cây'},
  {k:'金曜日',vi:'Thứ Sáu',r:['きんようび'],tip:'金 vàng, kim loại'},
  {k:'土曜日',vi:'Thứ Bảy',r:['どようび'],tip:'土 đất'}
 ],
 asks:[
  {k:'何日',vi:'ngày mấy? (mùng mấy)',r:['なんにち']},
  {k:'何月',vi:'tháng mấy?',r:['なんがつ']},
  {k:'何曜日',vi:'thứ mấy?',r:['なんようび']}
 ]
};
