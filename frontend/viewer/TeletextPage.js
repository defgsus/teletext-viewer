

const TeletextPageLine = ({line, set_page_index}) => {

    return (
        <div>
            {line.map(block => {
                let color, content, link;
                if (block.length === 2) {
                    [color, content] = block;
                } else {
                    [color, link, content] = block;
                }
                let className = `color-fg-${color[0]} color-bg-${color[1]}`;
                let onClick = null;
                let title = null;

                if (link) {
                    className = `${className} link`;
                    let page, sub_page = 1;
                    if (typeof link === "object") {
                        page = link[0];
                        sub_page = link[1] || 1;
                    } else {
                        page = link;
                    }

                    title = `Go to page ${page}-${sub_page}`;
                    onClick = () => set_page_index(page, sub_page);
                }
                return (
                    <span
                        className={className}
                        onClick={onClick}
                        title={title}
                    >
                        {content}
                    </span>
                );
            })}
        </div>
    );
};

const TeletextPage = ({page, page_index, set_page_index, timestamp, channel, big}) => {

    let header = `${channel} ${page_index[0]}-${page_index[1]}`;
    if (timestamp?.timestamp) {
        const ts = timestamp.timestamp.replace("T", " ");
        header = header.padEnd(40 - ts.length) + ts;
    }

    return (
        <div className={"teletext-page-wrapper"}>
            <div className={big ? "teletext-page big" : "teletext-page"}>
                <TeletextPageLine line={[["ab", [header.padEnd(40)]]]}/>
                <TeletextPageLine line={[["ab", ["".padEnd(40)]]]}/>
                {!page?.lines
                    ? (
                        <>
                            <TeletextPageLine line={[["rb", "".padEnd(40)]]}/>
                            <TeletextPageLine line={[["rb", "404".padStart(21).padEnd(40)]]}/>
                            <TeletextPageLine line={[["rb", "".padEnd(40)]]}/>
                            <TeletextPageLine line={[["rb", "not found".padStart(24).padEnd(40)]]}/>
                            {[...Array(25)].map((_, i) => (
                                <TeletextPageLine key={i} line={[["wb"], "".padEnd(40)]}/>
                            ))}
                        </>
                    ) : (
                        page.lines.map((line, y) => (
                            <TeletextPageLine
                                key={y}
                                line={line}
                                set_page_index={set_page_index}
                            />
                        ))
                    )
                }
            </div>
            {/*<div>{JSON.stringify(page?.lines)}</div>*/}
        </div>
    );
};

export default TeletextPage;
