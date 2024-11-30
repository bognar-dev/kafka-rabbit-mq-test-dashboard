export async function GET() {

    const response = await fetch('http://localhost:8080/api/metrics');
    if (!response.ok) {
        return new Response('Failed to fetch metrics', { status: 500 });
    }
    const data = await response.text();
    return new Response(data, {
        headers: { 'Content-Type': 'text/plain' },
    });

}