import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { SingleQuery } from "@/app/lib/dbAdapter";
import { bioFormSchema } from "@/app/(protected)/user/bio/types/bio";
import { serverLogger } from "@/app/lib/logging/logger.server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await SingleQuery(
      `SELECT 
        address_line_1, 
        address_line_2, 
        city, 
        state_province, 
        postal_code, 
        country, 
        phone_number, 
        date_of_birth, 
        gender, 
        height 
      FROM user_bio 
      WHERE user_id = $1`,
      [session.user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({});
    }

    const bioData = result.rows[0];
    return NextResponse.json(bioData);
  } catch (error) {
    await serverLogger.error('Error fetching user bio', error);
    return NextResponse.json(
      { error: "Failed to fetch user bio" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const validatedData = bioFormSchema.parse(data);

    // Format the date to match PostgreSQL date format
    const formattedDate = new Date(validatedData.dateOfBirth)
      .toISOString()
      .split("T")[0];

    // Check if user bio already exists
    const existingBio = await SingleQuery(
      "SELECT id FROM user_bio WHERE user_id = $1",
      [session.user.id]
    );

    if (existingBio.rows.length > 0) {
      // Update existing bio
      await SingleQuery(
        `UPDATE user_bio 
        SET 
          address_line_1 = $1,
          address_line_2 = $2,
          city = $3,
          state_province = $4,
          postal_code = $5,
          country = $6,
          phone_number = $7,
          date_of_birth = $8,
          gender = $9,
          height = $10,
          updated_date = NOW()
        WHERE user_id = $11`,
        [
          validatedData.addressLine1,
          validatedData.addressLine2,
          validatedData.city,
          validatedData.stateProvince,
          validatedData.postalCode,
          validatedData.country?.value,
          validatedData.phoneNumber,
          formattedDate,
          validatedData.gender,
          validatedData.height,
          session.user.id,
        ]
      );
    } else {
      // Insert new bio
      await SingleQuery(
        `INSERT INTO user_bio (
          user_id,
          address_line_1,
          address_line_2,
          city,
          state_province,
          postal_code,
          country,
          phone_number,
          date_of_birth,
          gender,
          height
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          session.user.id,
          validatedData.addressLine1,
          validatedData.addressLine2,
          validatedData.city,
          validatedData.stateProvince,
          validatedData.postalCode,
          validatedData.country?.value,
          validatedData.phoneNumber,
          formattedDate,
          validatedData.gender,
          validatedData.height,
        ]
      );
    }

    return NextResponse.json({ message: "Bio updated successfully" });
  } catch (error) {
    await serverLogger.error('Error saving user bio', error);
    return NextResponse.json(
      { error: "Failed to save user bio" },
      { status: 500 }
    );
  }
} 