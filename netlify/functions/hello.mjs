// Funkcja testowa etapu M0 — potwierdza, że routing /api/* i runtime funkcji działają.
// Netlify Functions v2: eksport domyślny przyjmuje Request i zwraca Response.
// Trasa nie jest ustawiana przez `config.path` — wchodzi z rewrite'u /api/* w netlify.toml.

export default async (request) => {
  return Response.json(
    {
      ok: true,
      ts: new Date().toISOString(),
    },
    {
      headers: {
        // Odpowiedź diagnostyczna — nie chcemy jej cache'ować.
        "cache-control": "no-store",
      },
    }
  );
};
