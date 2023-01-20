import {useEffect, useState} from "react";
import "./style.scss"
import TeletextPage from "./TeletextPage";


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

                line = JSON.parse(line);
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
    const [page_index, set_page_index] = useState([100, 1]);
    const [current_page, set_current_page] = useState(null);

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
                set_timestamps(timestamps);
                set_timestamp(timestamps[timestamps.length - 1]);
                set_error(null);
            })
            .catch(e => set_error(`Failed to fetch timestamp data: ${e}`));
    }, []);

    useEffect(() => {
        if (timestamp) {
            fetch_channel_pages(timestamp.repo_name, timestamp.hash, channel)
                .then(pages => {
                    set_channel_pages(pages);
                    set_error(null);
                })
                .catch(e => set_error(`Failed to fetch teletext data: ${e}`));
        }
    }, [timestamps, timestamp, channel]);

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

    return (
        <div className={"teletext-viewer"}>
            {!error ? null : <div className={"error"}>{error}</div>}

            <div className={"channels"}>
                {CHANNELS.map(c => (
                    <button
                        key={c}
                        disabled={c === channel}
                        onClick={() => set_channel(c)}
                    >
                        {c}
                    </button>
                ))}
            </div>
            <div>
                {JSON.stringify(page_index)}
            </div>
            <TeletextPage
                page={current_page}
                set_page_index={(p, s) => set_page_index([p, s])}
            />

            <div className={"timestamps"}>
                {timestamps.map(ts => (
                    <div key={ts.hash}>{ts.timestamp}</div>
                ))}
            </div>
        </div>
    )
};

export default TeletextViewer;