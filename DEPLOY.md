# Hướng dẫn Deploy

## Fix lỗi 404 NOT_FOUND

Lỗi 404 xảy ra khi server không tìm thấy route. Đã cấu hình các file sau để fix:

### Các file cấu hình đã tạo:

1. **`public/_redirects`** - Cho Netlify và các static hosting khác
2. **`netlify.toml`** - Cấu hình cho Netlify
3. **`vercel.json`** - Cấu hình cho Vercel
4. **`.htaccess`** - Cho Apache server
5. **`render.yaml`** - Cho Render.com

### Render.com

Nếu bạn đang deploy trên Render.com:

1. Vào **Settings** → **Redirects and Rewrites**
2. Thêm rule:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Type**: Rewrite

Hoặc sử dụng file `render.yaml` đã được tạo.

### Vercel

File `vercel.json` đã được cấu hình. Chỉ cần deploy bình thường.

### Netlify

File `netlify.toml` và `_redirects` đã được cấu hình. Chỉ cần deploy bình thường.

### Apache/Shared Hosting

File `.htaccess` đã được tạo trong `dist` folder. Đảm bảo server hỗ trợ mod_rewrite.

## Build và Deploy

```bash
npm run build
```

Sau đó deploy folder `dist` lên hosting của bạn.

## Kiểm tra

Sau khi deploy, thử truy cập:
- `https://your-domain.com/appointments?bookingcode=APT202511059EBECE8B`

Nếu không còn lỗi 404, cấu hình đã thành công!

