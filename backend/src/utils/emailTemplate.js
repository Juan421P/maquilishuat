// Plantilla HTML compartida para los correos de verificación de cuenta y
// recuperación de contraseña. Antes se mandaban como texto plano.
export const brandEmailHtml = ({ title, intro, code, footer }) => `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#f8f9fb;font-family:Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fb;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background-color:#a855f7;padding:28px 32px;">
                <span style="color:#ffffff;font-size:20px;font-weight:800;">&#128167; Maquilishuat</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 8px;font-size:18px;color:#111827;">${title}</h1>
                <p style="margin:0 0 24px;font-size:14px;line-height:22px;color:#374151;">${intro}</p>
                <div style="text-align:center;margin:0 0 24px;">
                  <span style="display:inline-block;padding:14px 28px;border-radius:12px;background-color:#f3e8ff;font-size:28px;font-weight:800;letter-spacing:6px;color:#7e22ce;">${code}</span>
                </div>
                <p style="margin:0;font-size:12.5px;line-height:20px;color:#6b7280;">${footer}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px;background-color:#f8f9fb;">
                <p style="margin:0;font-size:11.5px;color:#9ca3af;">Maquilishuat S.A. de C.V. &middot; Agua purificada a domicilio en El Salvador</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
