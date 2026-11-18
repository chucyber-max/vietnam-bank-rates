import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const headerPassword = request.headers.get('x-admin-password');
    let bodyPassword = '';

    try {
      const body = await request.json();
      if (body && typeof body.password === 'string') {
        bodyPassword = body.password;
      }
    } catch {
      // Body may be empty if password was passed purely via header
    }

    const providedPassword = (headerPassword || bodyPassword || '').trim();
    const expectedSecret = (process.env.ADMIN_SECRET || '').trim();

    if (!expectedSecret) {
      return NextResponse.json(
        {
          success: false,
          error: 'Hệ thống chưa thiết lập ADMIN_SECRET trong biến môi trường.',
        },
        { status: 500 }
      );
    }

    if (!providedPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Vui lòng cung cấp mật khẩu quản trị.',
        },
        { status: 400 }
      );
    }

    if (providedPassword !== expectedSecret) {
      return NextResponse.json(
        {
          success: false,
          error: 'Mật khẩu quản trị không chính xác. Vui lòng thử lại.',
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Xác thực quyền quản trị viên thành công.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Lỗi xác thực máy chủ.',
      },
      { status: 500 }
    );
  }
}
