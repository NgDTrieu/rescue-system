import { connectDB } from "../shared/db";
import { ServiceCategoryModel } from "../modules/categories/category.model";

async function main() {
  await connectDB();

  const defaults = [
    { key: "FUEL", name: "Cứu hộ hết xăng", description: "Tiếp nhiên liệu tại chỗ" },
    { key: "TIRE", name: "Cứu hộ thủng lốp", description: "Vá lốp/thay lốp" },
    { key: "BATTERY", name: "Cứu hộ hết ắc quy", description: "Kích bình/nạp điện" },
    { key: "TOW", name: "Kéo xe", description: "Kéo xe về gara/điểm chỉ định" },
    { key: "LOCKOUT", name: "Mở khóa xe", description: "Quên chìa/khóa trong xe" },
  ];

  for (const item of defaults) {
    await ServiceCategoryModel.updateOne(
      { key: item.key },
      { $setOnInsert: { ...item, isActive: true } },
      { upsert: true }
    );
  }

  const count = await ServiceCategoryModel.countDocuments();
  console.log("Seeded categories. Total:", count);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
