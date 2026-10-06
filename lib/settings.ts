import { prisma } from "@/lib/db";
import { SITE_NAME, SITE_TAGLINE, REWARDS, SHIPPING } from "@/lib/config";

export type PlatformSettingsData = {
  id: string;
  siteName: string;
  siteTagline: string;
  supportPhone: string;
  currencySymbol: string;
  logoUrl: string | null;
  logoLightUrl: string | null;
  signupBonusPoints: number;
  referredBonusPoints: number;
  referrerBonusPoints: number;
  pointValueCents: number;
  freeShippingCents: number;
  flatShippingCents: number;
  updatedAt: Date;
};

export async function getPlatformSettings(): Promise<PlatformSettingsData> {
  try {
    let setting = await prisma.platformSetting.findUnique({
      where: { id: "global" },
    });

    if (!setting) {
      setting = await prisma.platformSetting.upsert({
        where: { id: "global" },
        update: {},
        create: {
          id: "global",
          siteName: SITE_NAME,
          siteTagline: SITE_TAGLINE,
          supportPhone: "(123) 456-7890",
          currencySymbol: "$",
          logoUrl: "/logo.svg",
          logoLightUrl: "/logo-light.svg",
          signupBonusPoints: REWARDS.SIGNUP_BONUS,
          referredBonusPoints: REWARDS.REFERRED_SIGNUP_BONUS,
          referrerBonusPoints: REWARDS.REFERRER_BONUS,
          pointValueCents: REWARDS.POINT_VALUE_CENTS,
          freeShippingCents: SHIPPING.FREE_OVER_CENTS,
          flatShippingCents: SHIPPING.FLAT_CENTS,
        },
      });
    }

    return setting;
  } catch (error) {
    console.error("Failed to fetch platform settings:", error);
    return {
      id: "global",
      siteName: SITE_NAME,
      siteTagline: SITE_TAGLINE,
      supportPhone: "(123) 456-7890",
      currencySymbol: "$",
      logoUrl: "/logo.svg",
      logoLightUrl: "/logo-light.svg",
      signupBonusPoints: REWARDS.SIGNUP_BONUS,
      referredBonusPoints: REWARDS.REFERRED_SIGNUP_BONUS,
      referrerBonusPoints: REWARDS.REFERRER_BONUS,
      pointValueCents: REWARDS.POINT_VALUE_CENTS,
      freeShippingCents: SHIPPING.FREE_OVER_CENTS,
      flatShippingCents: SHIPPING.FLAT_CENTS,
      updatedAt: new Date(),
    };
  }
}
