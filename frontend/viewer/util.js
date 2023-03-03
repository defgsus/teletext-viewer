

export const timestamp_str = (ts) => {
    if (!ts)
        return "";
    return ts.replaceAll("T", " ");
};

/** patch page links to the content blocks */
export const add_page_links = (pages) => {
    const page_index = new Set();
    for (const page of pages) {
        page_index.add(page.page);
    }

    for (const page of pages) {
        for (const line of page.lines) {
            const new_line = [];
            let line_changed = false;
            for (const block of line) {

                let color, content, link;
                if (block.length === 2) {
                    [color, content] = block;
                } else {
                    [color, link, content] = block;
                }
                if (link) {
                    new_line.push(block);
                } else {
                    const r = /(\d\d\d)/d;
                    let match_index;
                    let block_changed = false;
                    while ((match_index = r.exec(content)) !== null) {
                        const match = parseInt(match_index[0]);
                        const [start, end] = match_index.indices[0];
                        if (start > 0) {
                            new_line.push([color, content.slice(0, start)]);
                        }
                        if (!page_index.has(match)) {
                            new_line.push([color, content.slice(start, end)])
                        } else {
                            new_line.push([color, parseInt(match), content.slice(start, end)]);
                            block_changed = true;
                        }
                        content = content.slice(end);
                    }
                    if (!block_changed) {
                        new_line.push(block);
                    } else {
                        if (content.length) {
                            new_line.push([color, content]);
                        }
                        line_changed = true;
                    }
                }
            }
            if (line_changed) {
                line.length = 0;
                for (const block of new_line)
                    line.push(block);
            }
        }
    }
};