import { FC } from "react";
import ReactPaginate from "react-paginate";

interface PaginationProps {
    onPageChange: (pageInfo: { selected: number, limit: number }) => void;
    count: number;
    page: number;
    limit: number;
}

const Pagination: FC<PaginationProps> = ({ onPageChange, page, count, limit }) => {
    const perPageOptions: number[] = [10, 30, 50, 100];
    const handlePerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = parseInt(event.target.value, 10);
        console.log(value)
        if (value !== limit) {
            onPageChange({ selected: 0, limit: value });
        }
    };

    const handlePageChange = (pageInfo: { selected: number }) => {
        onPageChange({ ...pageInfo, limit });
    };

        // ▼ New Values
        const start = (page - 1) * limit + 1;
        const end = Math.min(page * limit, count);

    return (
        <div className="w-full flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
                {/* <div className="w-20">
                    <select
                        name="limit"
                        value={limit}
                        onChange={handlePerPageChange}
                        className="w-full h-10 border border-gray-300 rounded px-2"
                    >
                        {perPageOptions.map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                </div> */}

                <span className="text-foreground text-sm">
                    Showing {start}–{end} of {count} results
                </span>
            </div>
            <ReactPaginate
                breakLabel="..."
                nextLabel=">"
                onPageChange={handlePageChange}
                pageRangeDisplayed={5}
                pageCount={Math.ceil(count / limit)}
                previousLabel="<"
                renderOnZeroPageCount={null}
                forcePage={page - 1}
                containerClassName="flex list-none gap-2 flex-wrap"
                pageLinkClassName="px-3 py-2 bg-card text-foreground text-sm font-bold border border-border-main rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                activeLinkClassName="!bg-primary !text-white"
                previousLinkClassName="px-3 py-2 text-foreground hover:text-primary text-sm font-bold transition-colors"
                nextLinkClassName="px-3 py-2 text-foreground hover:text-primary text-sm font-bold transition-colors"
            />
        </div>
    );
};

export default Pagination;