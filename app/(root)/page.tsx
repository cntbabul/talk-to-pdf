import HeroSection from "@/components/HeroSection";
import BookCard from "@/components/BookCard";
import { getAllBooks } from "@/lib/actions/book.actions";
import Search from "@/components/Search";
import Link from "next/link";

const Page = async ({ searchParams }: { searchParams: Promise<{ query?: string }> }) => {
  const { query } = await searchParams;

  const bookResults = await getAllBooks(query)
  const books = bookResults.success ? bookResults.data ?? [] : []
  const hasError = !bookResults.success
  // console.log("books", books)

  return (
    <main className="wrapper container pt-7">
      <HeroSection />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-10">
        <h2 className="text-3xl font-serif font-bold text-[#0f172a]">Recent Books</h2>
        <Search />
      </div>

      <div className="library-books-grid min-h-100">
        {hasError ? (
          <div className="col-span-full py-20 text-center bg-red-50/50 rounded-2xl border border-red-100">
            <div className="max-w-md mx-auto space-y-4">
              <p className="text-red-600 font-semibold text-xl">Something went wrong</p>
              <p className="text-red-500/80">We couldn&apos;t load your library. This might be a temporary connection issue.</p>
              <Link
                href="/"
                className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium mt-2"
              >
                Retry Again
              </Link>
            </div>
          </div>
        ) : books.length > 0 ? (
          books.map((book) => (
            <BookCard key={book._id} title={book.title} author={book.author} coverURL={book.coverURL} slug={book.slug} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-[#f1f5f9]/30 rounded-2xl border border-dashed border-[#94a3b8]/20">
            <div className="max-w-md mx-auto space-y-3">
              <p className="text-[#0f172a] font-bold text-xl">Your library is empty</p>
              <p className="text-[#334155] text-lg">
                {query ? (
                  <>No books matching <span className="font-semibold">&quot;{query}&quot;</span> found.</>
                ) : (
                  "You haven't uploaded any books yet. Start your literary journey today!"
                )}
              </p>
              {!query && (
                <div className="pt-4">
                  <Link href="/books/new" className="px-8 py-3 bg-[#0f172a] text-white rounded-xl hover:bg-[#334155] transition-all font-semibold shadow-soft">
                    Upload Your First Book
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default Page