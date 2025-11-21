import { NextRequest, NextResponse } from "next/server";
import db, { EntityType } from "@/lib/dynamodb";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface FeeConfiguration {
  year: string;
  hostelFee: number;
  maintenanceFee: number;
  securityDeposit: number;
  otherFees: number;
  totalFee: number;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("student_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    try {
      verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Get current year
    const currentYear = new Date().getFullYear().toString();

    // Try to fetch the current year's fee configuration
    let feeConfig: FeeConfiguration | null = null;

    try {
      const config = await db.get(
        `FEE_CONFIG#${currentYear}`,
        `FEE_CONFIG#${currentYear}`
      );

      if (config) {
        feeConfig = {
          year: config.year,
          hostelFee: config.hostelFee,
          maintenanceFee: config.maintenanceFee,
          securityDeposit: config.securityDeposit,
          otherFees: config.otherFees,
          totalFee: config.totalFee,
          createdAt: config.createdAt,
          updatedAt: config.updatedAt,
        };
      }
    } catch (error) {
      console.log("No fee configuration found for current year");
    }

    // If no configuration found for current year, return default
    if (!feeConfig) {
      return NextResponse.json({
        feeConfiguration: null,
        message: "No fee configuration found for current year",
      });
    }

    return NextResponse.json({ feeConfiguration: feeConfig });
  } catch (error) {
    console.error("Error fetching fee configuration:", error);
    return NextResponse.json(
      { error: "Failed to fetch fee configuration" },
      { status: 500 }
    );
  }
}
