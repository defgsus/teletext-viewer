import {useEffect, useState} from "react";


const PageSelect = ({page_index, set_page_index}) => {
    const [page, set_page] = useState();
    const [sub_page, set_sub_page] = useState();

    useEffect(() => {
        set_page(page_index[0]);
        set_sub_page(page_index[1]);
    }, [page_index]);

    const on_page_change = (event) => {
        const page = parseInt(event.target.value);
        if (!isNaN(page))
            set_page_index([page, page_index[1]]);
    }
    const on_sub_page_change = (event) => {
        const page = parseInt(event.target.value);
        if (!isNaN(page))
            set_page_index([page_index[0], page]);
    }

    return (
        <div className={"page-select"}>
            <input type={"number"} value={page} min={100} max={999} onChange={on_page_change}/>
            <input type={"number"} value={sub_page} min={1} onChange={on_sub_page_change}/>
        </div>
    );
};

export default PageSelect;
