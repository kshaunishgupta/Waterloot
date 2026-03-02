import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isbn = searchParams.get("isbn");

  if (!isbn) {
    return NextResponse.json({ error: "ISBN is required" }, { status: 400 });
  }

  // Clean ISBN (remove hyphens and spaces)
  const cleanIsbn = isbn.replace(/[-\s]/g, "");

  try {
    const response = await fetch(
      `https://openlibrary.org/isbn/${cleanIsbn}.json`,
      { next: { revalidate: 86400 } } // Cache for 24 hours
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Book not found. Please enter details manually." },
        { status: 404 }
      );
    }

    const data = await response.json();

    // Fetch author name if available
    let authorName = "";
    if (data.authors?.[0]?.key) {
      try {
        const authorRes = await fetch(
          `https://openlibrary.org${data.authors[0].key}.json`
        );
        if (authorRes.ok) {
          const authorData = await authorRes.json();
          authorName = authorData.name || "";
        }
      } catch {
        // Author lookup failed, continue without it
      }
    }

    return NextResponse.json({
      title: data.title || "",
      author: authorName,
      edition: data.edition_name || "",
      coverUrl: data.covers?.[0]
        ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-M.jpg`
        : null,
      publishDate: data.publish_date || "",
      publishers: data.publishers || [],
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to look up ISBN. Please try again." },
      { status: 500 }
    );
  }
}
