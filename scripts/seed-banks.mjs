import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sampleBanks = [
  {
    bankName: "ABA Bank (KHQR)",
    bankCode: "ABA",
    accountName: "SNL PLATFORM CO., LTD",
    accountNumber: "001 889 999",
    currency: "USD",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/ABA_Bank_logo.svg/320px-ABA_Bank_logo.svg.png",
    qrImageUrl: "https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=https://link.payway.com.kh/aba?id=SNLPLATFORM_ABA_USD",
    instructions: "Scan KHQR with ABA Mobile or any Bakong banking app. Transfer exact amount and upload your transaction receipt slip below.",
    active: true,
    displayOrder: 1,
  },
  {
    bankName: "Bakong KHQR (All Banks)",
    bankCode: "BAKONG",
    accountName: "SNL PLATFORM OFFICIAL",
    accountNumber: "snlrich@bkng",
    currency: "USD",
    logoUrl: "https://bakong.nbc.gov.kh/images/bakong-logo-en.png",
    qrImageUrl: "https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=https://bakong.nbc.org.kh/khqr/snlrich@bkng",
    instructions: "Universal Cambodia KHQR code. Supported by all 40+ banks and financial institutions in Cambodia via Bakong app.",
    active: true,
    displayOrder: 2,
  },
  {
    bankName: "ACLEDA Bank Plc.",
    bankCode: "ACLEDA",
    accountName: "SNL PLATFORM TRADING",
    accountNumber: "0100 2345 6789 12",
    currency: "USD",
    logoUrl: "https://www.acledabank.com.kh/kh/assets/layout/images/logo.png",
    qrImageUrl: "https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=https://acleda.com.kh/pay?acc=01002345678912",
    instructions: "Pay via ACLEDA Mobile or cross-bank transfer to ACLEDA account. Please input your Account ID or Phone in remark.",
    active: true,
    displayOrder: 3,
  },
  {
    bankName: "Wing Bank (Cambodia)",
    bankCode: "WING",
    accountName: "SNL PLATFORM DEPOSIT",
    accountNumber: "098 765 432",
    currency: "USD",
    logoUrl: "https://www.wingmoney.com/wp-content/themes/wing-theme/assets/images/logo-green.svg",
    qrImageUrl: "https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=https://wingmoney.com/pay?account=098765432",
    instructions: "Scan via Wing Bank App or transfer from any Wing Agent nationwide.",
    active: true,
    displayOrder: 4,
  },
];

async function main() {
  console.log("Seeding Cambodia Platform Banks...");
  for (const b of sampleBanks) {
    const existing = await prisma.platformBank.findFirst({
      where: { bankName: b.bankName },
    });
    if (!existing) {
      await prisma.platformBank.create({
        data: b,
      });
      console.log(`Created platform bank: ${b.bankName}`);
    } else {
      console.log(`Platform bank already exists: ${b.bankName}`);
    }
  }
  console.log("Done seeding Cambodia Platform Banks.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
