import { NextRequest, NextResponse } from "next/server";
import db, { EntityType } from "@/lib/dynamodb";
import { verifyToken } from "@/lib/auth";

export interface FeeConfiguration {
  PK: string; // FEE_CONFIG#year
  SK: string; // FEE_CONFIG#year
  entityType: string;
  year: string;
  hostelFee: number;
  maintenanceFee: number;
  securityDeposit: number;
  otherFees: number;
  totalFee: number;
  createdAt: string;
  updatedAt: string;
}

// GET - Fetch all fee configurations
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all fee configurations
    const feeConfigs = await db.scan("begins_with(PK, :pk)", {
      ":pk": "FEE_CONFIG#",
    });

    return NextResponse.json({
      feeConfigurations: feeConfigs.sort((a: any, b: any) =>
        b.year.localeCompare(a.year)
      ),
    });
  } catch (error) {
    console.error("Get fee configurations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch fee configurations" },
      { status: 500 }
    );
  }
}

// POST - Create or update fee configuration
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { year, hostelFee, maintenanceFee, securityDeposit, otherFees } = body;

    // Validate input
    if (!year || hostelFee === undefined) {
      return NextResponse.json(
        { error: "Year and hostel fee are required" },
        { status: 400 }
      );
    }

    const totalFee =
      parseFloat(hostelFee || 0) +
      parseFloat(maintenanceFee || 0) +
      parseFloat(securityDeposit || 0) +
      parseFloat(otherFees || 0);

    // Check if fee config already exists
    const existingConfig = await db.get(
      `FEE_CONFIG#${year}`,
      `FEE_CONFIG#${year}`
    );

    const feeConfig: FeeConfiguration = {
      PK: `FEE_CONFIG#${year}`,
      SK: `FEE_CONFIG#${year}`,
      entityType: "FEE_CONFIG",
      year,
      hostelFee: parseFloat(hostelFee),
      maintenanceFee: parseFloat(maintenanceFee || 0),
      securityDeposit: parseFloat(securityDeposit || 0),
      otherFees: parseFloat(otherFees || 0),
      totalFee,
      createdAt: existingConfig ? (existingConfig as any).createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.put(feeConfig);

    return NextResponse.json({
      message: existingConfig ? "Fee configuration updated" : "Fee configuration created",
      feeConfiguration: feeConfig,
    });
  } catch (error) {
    console.error("Create/Update fee configuration error:", error);
    return NextResponse.json(
      { error: "Failed to save fee configuration" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a fee configuration
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");

    if (!year) {
      return NextResponse.json(
        { error: "Year is required" },
        { status: 400 }
      );
    }

    await db.delete(`FEE_CONFIG#${year}`, `FEE_CONFIG#${year}`);

    return NextResponse.json({
      message: "Fee configuration deleted successfully",
    });
  } catch (error) {
    console.error("Delete fee configuration error:", error);
    return NextResponse.json(
      { error: "Failed to delete fee configuration" },
      { status: 500 }
    );
  }
}
