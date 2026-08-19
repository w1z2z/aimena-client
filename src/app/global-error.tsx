"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Manrope', Arial, sans-serif",
          background: "#f6f8fb",
          color: "#1A1A1A",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <main>
          <p
            style={{
              fontSize: 120,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              color: "#8E8BED",
              margin: 0,
            }}
          >
            500
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 16 }}>
            Что-то пошло не так
          </h1>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.5,
              color: "#626262",
              maxWidth: 420,
              margin: "12px auto 0",
            }}
          >
            Произошла непредвиденная ошибка. Попробуйте обновить страницу.
          </p>
          <div style={{ marginTop: 32, display: "flex", gap: 16, justifyContent: "center" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                height: 44,
                padding: "0 32px",
                borderRadius: 36,
                border: "none",
                background: "#8E8BED",
                color: "#fff",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Попробовать снова
            </button>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: 44,
                padding: "0 32px",
                borderRadius: 36,
                border: "1px solid #CACACA",
                background: "#fff",
                color: "#1A1A1A",
                fontSize: 15,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              На главную
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
