import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        // 1. Initialize Supabase Admin client inside the handler
        // This avoids build-time initialization issues if env vars are missing context
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!serviceRoleKey) {
            throw new Error("Missing server configuration (SERVICE_ROLE_KEY)");
        }

        const supabaseAdmin = createClient(
            supabaseUrl,
            serviceRoleKey,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // 2. Read Body
        const body = await req.json();
        const { detailsId, owner_email } = body;

        if (!detailsId || !owner_email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 3. Generate secure random password
        const password = crypto.randomBytes(12).toString('hex'); // 24 chars hex

        // 4. Create User in Supabase Auth
        // auto_confirm: true skips the email confirmation requirement if configured
        const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: owner_email,
            password: password,
            email_confirm: true
        });

        if (createError) {
            if (createError.message.includes("already registered")) {
                return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
            }
            throw createError;
        }

        // 5. Update the restaurant_details table
        const { error: updateError } = await supabaseAdmin
            .from('restaurant_details')
            .update({
                credentials_created: true,
            })
            .eq('id', detailsId);

        if (updateError) {
            console.error("Failed to update registration status:", updateError);
            return NextResponse.json({ error: 'Created user but failed to update database status' }, { status: 500 });
        }

        // 6. Return credentials
        return NextResponse.json({
            email: owner_email,
            password: password
        });

    } catch (error: any) {
        console.error('Create Login Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
