export default function ComplejosLoading() {
    return (
        <section className="mx-auto max-w-6xl space-y-7" aria-busy="true">
            <div className="space-y-3 border-b border-[#dce5e0] pb-6">
                <div className="h-4 w-28 animate-pulse rounded bg-[#dce5e0]" />
                <div className="h-9 w-56 animate-pulse rounded bg-[#dce5e0]" />
                <div className="h-4 w-80 max-w-full animate-pulse rounded bg-[#e8eeea]" />
            </div>
            <div className="h-10 w-full animate-pulse rounded-lg bg-[#e8eeea] sm:ml-auto sm:w-72" />
            <div className="space-y-3 rounded-lg border border-[#dce5e0] bg-white p-5">
                {Array.from({ length: 4 }, (_, index) => (
                    <div key={index} className="h-14 animate-pulse rounded bg-[#f5f8f6]" />
                ))}
            </div>
            <span className="sr-only">Cargando complejos...</span>
        </section>
    );
}
