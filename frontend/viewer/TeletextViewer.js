import {useEffect, useState} from "react";
import "./style.scss"
import TeletextPage from "./TeletextPage";
import DropdownValue from "./DropdownValue";
import UrlHash from "./UrlHash";


const ARCHIVE_REPOS = [
    "defgsus/teletext-archive-unicode",
    "defgsus/teletext-archive-2023",
];

const CHANNELS = [
    "3sat", "ard", "ndr", "ntv", "sr", "wdr", "zdf", "zdf-info", "zdf-neo",
];


const fetch_timestamps = (repo_name) => {
    return fetch(`https://raw.githubusercontent.com/${repo_name}/master/docs/snapshots/_timestamps.ndjson`)
        .then(r => r.text())
        .then(text => {
            const timestamps = [];
            for (const line of text.split("\n")) {
                if (line.length)
                    timestamps.push({...JSON.parse(line), repo_name});
            }
            return timestamps;
        });
};


const fetch_channel_pages = (repo_name, commit_hash, channel) => {
    return fetch(`https://raw.githubusercontent.com/${repo_name}/${commit_hash}/docs/snapshots/${channel}.ndjson`)
        .then(r => r.text())
        .then(text => {
            const pages = [];
            let page = {};
            for (let line of text.split("\n")) {
                if (!line.length)
                    continue;

                try {
                    line = JSON.parse(line);
                }
                catch {
                    if (line.startsWith("["))
                        line = [["rb", "** ERROR PARSING LINE **".padEnd(40)]];
                    else
                        continue;
                }

                // start new page
                if (line.page) {
                    if (page.lines)
                        pages.push(page);
                    page = {
                        ...line,
                        lines: [],
                    };
                } else if (line.length) {
                    page.lines.push(line);
                }
            }
            if (page.lines)
                pages.push(page);
            return pages;
        });
};


const TeletextViewer = (props) => {
    const [error, set_error] = useState(null);
    const [timestamps, set_timestamps] = useState([]);
    const [channel, set_channel] = useState(CHANNELS[0]);
    const [timestamp, set_timestamp] = useState(null);
    const [channel_pages, set_channel_pages] = useState([]);
    const [page_indices, set_page_indices] = useState([]);
    const [page_index, set_page_index] = useState([100, 1]);
    const [current_page, set_current_page] = useState(null);
    const [is_loading, set_is_loading] = useState(true);

    // fetch timestamps from all repos
    useEffect(() => {
        let promise = null;
        for (const repo_name of ARCHIVE_REPOS) {
            const new_promise = fetch_timestamps(repo_name);
            if (!promise)
                promise = new_promise;
            else
                promise = promise.then(timestamps => {
                    return new_promise.then(new_timestamps => (
                        timestamps.concat(new_timestamps)
                    ))
                })
        }
        promise
            .then(timestamps => {
                set_timestamps(timestamps.reverse());
                set_timestamp(timestamps[0]);
                set_error(null);
            })
            .catch(e => set_error(`Failed to fetch timestamp data: ${e}`));
    }, []);

    // fetch channel's pages at timestamp
    useEffect(() => {
        if (timestamp?.repo_name) {
            set_is_loading(true);
            fetch_channel_pages(timestamp.repo_name, timestamp.hash, channel)
                .then(pages => {
                    set_channel_pages(pages);
                    set_page_indices(pages.map(p => [p.page, p.sub_page]));
                    set_error(null);
                    set_is_loading(false);
                    window.pages = pages;
                })
                .catch(e => {
                    set_error(`Failed to fetch teletext data: ${e}`);
                    set_channel_pages([]);
                    set_page_indices([]);
                    set_is_loading(false);
                });
        }
    }, [timestamps, timestamp, channel]);

    // update page data from selected index
    useEffect(() => {
        let new_page = null;
        for (const page of channel_pages) {
            if (page.page === page_index[0] && page.sub_page === page_index[1]) {
                new_page = page;
                break;
            }
        }
        set_current_page(new_page);
    }, [channel_pages, page_index]);

    // update url hash
    useEffect(() => {
        let new_hash = `#${channel}/${page_index.join("-")}`;
        if (timestamp?.timestamp)
            new_hash = `${new_hash}/${timestamp.timestamp}`;
        window.location.hash = new_hash;
    }, [channel, timestamp, page_index]);

    const on_url_hash_change = (hash) => {
        const params = hash ? hash.slice(1).split("/") : [];
        let new_channel = channel;
        let new_page_index = page_index.join("-");
        let new_timestamp = timestamp?.timestamp;
        if (params.length > 0)
            new_channel = params[0];
        if (params.length > 1)
            new_page_index = params[1];
        if (params.length > 2)
            new_timestamp = params[2];

        if (new_channel !== channel || new_page_index !== page_index || new_timestamp !== timestamp) {
            if (new_channel && new_channel !== channel && CHANNELS[new_channel])
                set_channel(new_channel);
            if (new_page_index && new_page_index !== page_index)
                set_page_index(new_page_index.split("-").map(i => parseInt(i)));
            if (new_timestamp && new_timestamp !== timestamp) {
                new_timestamp = timestamps.find(t => t.timestamp === new_timestamp);
                if (new_timestamp)
                    set_timestamp(new_timestamp);
            }
        }
    };

    return (
        <div className={"teletext-viewer"} {...props}>
            <UrlHash on_change={on_url_hash_change}/>
            {!error ? null : <div className={"error"}>{error}</div>}

            <div className={"channels"}>
                {CHANNELS.map(c => (
                    <div
                        key={c}
                        onClick={() => set_channel(c)}
                        className={
                            "channel" + (c === channel ? " selected" : "")
                            + (c === channel && is_loading ? " loading" : "")
                        }
                    >
                        {c.toUpperCase()}
                    </div>
                ))}
            </div>

            <div className={"controls"}>
                <div>
                    page: <DropdownValue
                        value={page_index}
                        set_value={set_page_index}
                        values={page_indices}
                        render={v => v.join("-")}
                        compare={(a, b) => a[0] === b[0] && a[1] === b[1]}
                    />
                </div>
                <div>
                    time: <DropdownValue
                        value={timestamp}
                        set_value={set_timestamp}
                        values={timestamps}
                        render={v => v?.timestamp}
                    />
                </div>
            </div>

            <TeletextPage
                page={current_page}
                page_index={page_index}
                timestamp={timestamp}
                channel={channel}
                set_page_index={(p, s) => set_page_index([p, s])}
                big={true}
            />

            {/*<div className={"timestamps"}>
                {timestamps.map(ts => (
                    <div key={ts.hash}>
                        <Timestamp timestamp={ts.timestamp}/>
                    </div>
                ))}
            </div>*/}
        </div>
    )
};

export default TeletextViewer;
