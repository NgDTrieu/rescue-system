import { Types } from "mongoose";
import { connectDB } from "../shared/db";
import { CommunityTipModel } from "../modules/communityTips/communityTip.model";

async function main() {
  await connectDB();

  const adminIdStr = "693da9c46b483475fdddb75d";
  if (!Types.ObjectId.isValid(adminIdStr)) {
    throw new Error("Invalid admin user id");
  }
  const adminId = new Types.ObjectId(adminIdStr);

  const tips = [
    {
      title: "Xe hết xăng giữa đường",
      solution:
        "Bật đèn cảnh báo (nếu có), dắt xe vào lề an toàn. Kiểm tra xem có cây xăng gần đó không. Nếu đang ở nơi vắng/đêm, ưu tiên gọi cứu hộ. Không để xe chắn làn đường. Nếu phải đứng chờ, đứng ở vị trí an toàn và quan sát xe cộ.",
    },
    {
      title: "Xe bị thủng lốp khi đang chạy",
      solution:
        "Giảm ga từ từ, không phanh gấp. Tấp vào lề an toàn. Kiểm tra lốp có dính đinh/vật nhọn, không rút vật ra nếu lốp xẹp nhanh (có thể xì mạnh). Nếu có đồ vá khẩn cấp/bơm mini thì xử lý tạm, sau đó đến tiệm vá. Nếu lốp rách lớn hoặc không có dụng cụ, gọi cứu hộ.",
    },
    {
      title: "Xe không đề được (nghi yếu bình ắc quy)",
      solution:
        "Kiểm tra đèn/còi có yếu không. Thử tắt hết phụ tải (đèn, sạc), đề lại. Nếu xe số: thử đạp nổ/đẩy nổ (nếu bạn biết làm và an toàn). Nếu xe tay ga/ô tô: cần kích bình hoặc cứu hộ. Tránh đề liên tục nhiều lần gây nóng đề.",
    },
    {
      title: "Xe chết máy sau khi đi qua đoạn ngập nhẹ",
      solution:
        "Tắt máy ngay, không cố đề lại nhiều lần. Dắt xe ra chỗ khô. Kiểm tra lọc gió/ống hút gió có bị ướt, lau khô khu vực bugi/cổ hút nếu có thể. Chờ 10–20 phút cho ráo rồi thử lại. Nếu nghi vào nước nặng (đề không nổ, máy kẹt), gọi cứu hộ để tránh hỏng nặng.",
    },
    {
      title: "Xe bị nóng máy/bốc mùi khét",
      solution:
        "Tấp vào lề, tắt máy và để nguội 10–15 phút. Kiểm tra nước làm mát (xe có két nước) hoặc dầu nhớt có rò rỉ. Không mở nắp két nước khi máy còn nóng. Nếu nhiệt độ vẫn cao hoặc có khói, không chạy tiếp—gọi cứu hộ/kéo xe.",
    },
    {
      title: "Xe bị khóa cổ/kẹt khóa hoặc mất chìa",
      solution:
        "Không cố bẻ khóa vì dễ hỏng nặng và nguy hiểm. Nếu có chìa dự phòng thì dùng. Nếu không, gọi thợ khóa/cứu hộ. Khi chờ, dắt xe vào nơi an toàn và giữ giấy tờ xe để xác minh quyền sở hữu.",
    },
  ];

  // Upsert theo title để chạy nhiều lần không bị nhân bản dữ liệu
  for (const t of tips) {
    await CommunityTipModel.updateOne(
      { title: t.title },
      { $setOnInsert: { ...t, createdBy: adminId } },
      { upsert: true }
    );
  }

  const total = await CommunityTipModel.countDocuments();
  console.log("[seed] community tips total =", total);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
