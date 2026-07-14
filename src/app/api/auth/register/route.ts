import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { User } from '@/lib/db/models/User';
import { hashPassword } from '@/lib/auth/bcrypt';
import { signToken } from '@/lib/auth/jwt';
import { registerSchema } from '@/lib/validations/authSchema';

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message || 'Invalid input' }, { status: 400 });
    }

    const { name, email, password, role } = parsed.data;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashed = await hashPassword(password);
    const user = await User.create({ name, email: email.toLowerCase(), password: hashed, role, active: true });

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return NextResponse.json({
      data: {
        token,
        user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
