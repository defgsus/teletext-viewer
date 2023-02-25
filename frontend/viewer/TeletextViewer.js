import {useEffect, useRef, useState} from "react";
import "./style.scss"
import TeletextPage from "./TeletextPage";
import DropdownValue from "./DropdownValue";
import UrlHash from "./UrlHash";
import {timestamp_str} from "./util";
import SlideshowControls from "./SlideshowControls";


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
    const [raw_input, set_raw_input] = useState(null);
    const [index_input, set_index_input] = useState(null);
    const [timestamp_input, set_timestamp_input] = useState(null);

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
                if (!timestamp)
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
        if (new_hash !== window.location.hash) {
            window.location.hash = new_hash;
        }
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
            if (new_channel && new_channel !== channel && CHANNELS.indexOf(new_channel) >= 0)
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

    const get_next_sub_page = (steps=1)=> {
        let index = page_indices?.findIndex(i => i[0] === page_index[0] && i[1] === page_index[1]);
        if (index >= 0) {
            index = index + steps;
            return page_indices[index] || null;
        }
        return null;
    };

    const get_next_timestamp = (steps=1)=> {
        let index = timestamps?.findIndex(i => i.timestamp === timestamp?.timestamp);
        if (index >= 0) {
            if (steps === 21) {
                const date = new Date(timestamp.timestamp);
                while (Math.abs(date - new Date(timestamps[index].timestamp)) / 1000 / 60 / 60 / 24 < 7) {
                    index += steps < 0 ? -1 : 1;
                    if (index < 0 || index >= timestamps.length)
                        return null;
                }
            } else if (steps === 3) {
                const day = timestamp.timestamp.slice(0, 10);
                while (timestamps[index].timestamp.startsWith(day)) {
                    index += steps < 0 ? -1 : 1;
                    if (index < 0 || index >= timestamps.length)
                        return null;
                }
            } else {
                index = index + steps;
            }
            return timestamps[index] || null;
        }
        return null;
    };

    const parse_raw_input = (raw_input) => {
        if (!raw_input) {
            set_index_input(null);
            set_timestamp_input(null);
            return;
        }
        if (raw_input.length === 3) {
            const num = parseInt(raw_input);
            const item = page_indices?.find(i => i[0] === num);
            set_index_input(item || null);
            set_timestamp_input(null);
        } else if (raw_input.length) {
            let ts;
            if (timestamp?.timestamp) {
                // try <current-year>-<raw-input> first
                const input = `${timestamp.timestamp.slice(0, 4)}-${raw_input}`;
                ts = timestamps?.find(ts => ts.timestamp.indexOf(input) >= 0);
            }
            if (!ts)
                ts = timestamps?.find(ts => ts.timestamp.indexOf(raw_input) >= 0);
            set_index_input(null);
            set_timestamp_input(ts || null);
        } else {
            set_index_input(null);
            set_timestamp_input(null);
        }
    };

    const handle_key = (event) => {
        console.log("KEY", event.key);
        if (event.ctrlKey || event.altKey || event.metaKey)
            return;

        let handled = true;
        switch (event.key) {
            case "ArrowLeft":
            case "ArrowRight": {
                const new_page_index = event.key === "ArrowLeft"
                    ? get_next_sub_page(-1) || page_indices[page_indices.length - 1]
                    : get_next_sub_page(1) || page_indices[0];
                if (new_page_index) {
                    set_page_index(new_page_index);
                }
                break;
            }
            case "ArrowUp":
            case "ArrowDown": {
                const new_timestamp = event.key === "ArrowUp"
                    ? get_next_timestamp(-1) || timestamps[timestamps.length - 1]
                    : get_next_timestamp(1) || timestamps[0];
                if (new_timestamp) {
                    set_timestamp(new_timestamp);
                }
                break;
            }
            case "PageUp":
            case "PageDown": {
                const new_timestamp = get_next_timestamp(event.key === "PageUp" ? -21 : 21);
                if (new_timestamp) {
                    set_timestamp(new_timestamp);
                }
                break;
            }
            case "Enter":
            case "Return": {
                if (index_input) {
                    set_page_index(index_input)
                } else if (timestamp_input) {
                    set_timestamp(timestamp_input);
                }
                set_raw_input(null);
                parse_raw_input(null);
                break;
            }
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
            case "-":
            case "/": {
                let new_input = (raw_input || "") + event.key;
                set_raw_input(new_input);
                parse_raw_input(new_input);
                break;
            }
            case "Backspace": {
                const new_input = raw_input?.length ? raw_input.slice(0, -1) : null;
                set_raw_input(new_input);
                parse_raw_input(new_input);
                break;
            }
            default:
                handled = false;
        }
        if (handled) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    // bind the newest state to the keydown handler
    useEffect(() => {
        document.onkeydown = handle_key;
    }, [page_indices, page_index, raw_input, index_input, timestamp_input, timestamps, timestamp]);

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
                {raw_input ? ([
                    <div key={0}>
                        > <span className={"edited"}>{raw_input}</span>
                    </div>,
                    <div key={1}>
                        {index_input
                            ? `(index ${index_input.join("-")})`
                            : timestamp_input
                                ? `(time ${timestamp_str(timestamp_input.timestamp)})`
                                : ""
                        }
                    </div>
                ]) : ([
                    <div key={0}>
                        <DropdownValue
                            value={index_input || page_index}
                            set_value={set_page_index}
                            values={page_indices}
                            render={v => v.join("-")}
                            compare={(a, b) => a[0] === b[0] && a[1] === b[1]}
                            className={index_input ? "edited" : null}
                        />{/*(prev: {prev_next_page[0]}, next: {prev_next_page[1]})*/}
                    </div>,
                    <div key={1}>
                        <DropdownValue
                            value={timestamp_input || timestamp}
                            set_value={set_timestamp}
                            values={timestamps}
                            render={v => timestamp_str(v?.timestamp)}
                            className={timestamp_input ? "edited" : null}
                        />
                    </div>
                ])}
            </div>

            <TeletextPage
                page={current_page}
                page_index={page_index}
                timestamp={timestamp}
                channel={channel}
                set_page_index={(p, s) => set_page_index([p, s])}
                big={true}
            />

            <SlideshowControls
                channels={CHANNELS}
                page_indices={page_indices}
                timestamps={timestamps}
                page_index={page_index}
                timestamp={timestamp}
                channel={channel}
                get_next_timestamp={get_next_timestamp}
                get_next_page={get_next_sub_page}
                set_timestamp={set_timestamp}
                set_page_index={set_page_index}
                set_channel={set_channel}
            />
        </div>
    )
};

export default TeletextViewer;
