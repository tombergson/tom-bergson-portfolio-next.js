// Musi być dynamiczne, inaczej Next wyrenderuje plik raz w czasie buildu
// i data Expires zostanie zamrożona na dzień budowania obrazu.
export const dynamic = "force-dynamic";

const CONTACT = "mailto:studio@tombergson.eu";
const CANONICAL = "https://tombergson.eu/.well-known/security.txt";
const VALID_DAYS = 360; // RFC 9116: Expires powinno wypadać w ciągu roku

export function GET() {
  const expires = new Date(Date.now() + VALID_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const body = [
    `Contact: ${CONTACT}`,
    `Expires: ${expires}`,
    "Preferred-Languages: pl, en",
    `Canonical: ${CANONICAL}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
