import {useEffect, useRef, useState} from "react";
import DropdownValue from "./DropdownValue";


const Checkbox = ({children, value, set_value}) => {
    return (
        <div className={"checkbox clickable"} onClick={() => set_value(!value)}>
            [{value ? "x" : " "}] {children}
        </div>
    )
}

const Button = ({children, value, set_value}) => {
    return (
        <div
            className={"button clickable" + (value ? " active" : "")}
            onClick={() => set_value(!value)}
        >
            {children}
        </div>
    )
};


const INTERVALS = [
    ["1s", 1],
    ["5s", 5],
    ["15s", 15],
    ["30s", 30],
    ["1m", 60],
    ["2m", 60 * 2],
    ["5m", 60 * 5],
];

const TIME_INTERVALS = ["keep", "+", "+ day", "+ week", "-", "- day", "- week", "shuffle"];
const PAGE_INTERVALS = ["keep", "+", "-", "shuffle"];
const CHANNEL_INTERVALS = ["keep", "+", "-", "shuffle"];

const TIME_INTERVAL_STEPS = {
    "+": -1, "+ day": -3, "+ week": -21,
    "-": 1, "- day": 3, "- week": 21,
};

const SlideshowControls = ({
        page_indices, timestamps, channels, get_next_page, get_next_timestamp,
        page_index, timestamp, channel, set_page_index, set_channel, set_timestamp,
}) => {

    const timeoutRef = useRef();
    const [visible, set_visible] = useState(false);
    const [interval, set_interval] = useState("5s");
    const [page_interval, set_page_interval] = useState("+");
    const [time_interval, set_time_interval] = useState("keep");
    const [channel_interval, set_channel_interval] = useState("keep");
    const [playing, set_playing] = useState(false);

    useEffect(() => {
        if (timeoutRef?.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        const interval_sec = INTERVALS.find(i => i[0] === interval)[1] * 1000;
        if (channels && timestamps && page_indices && playing) {
            timeoutRef.current = setTimeout(() => {

                let next_page = page_index;
                if (page_interval === "+")
                    next_page = get_next_page(1) || page_indices[0];
                else if (page_interval === "-")
                    next_page = get_next_page(-1) || page_indices[page_indices.length - 1];
                else if (page_interval === "shuffle")
                    next_page = page_indices[(Math.random() * (page_indices.length - 1)).toFixed()];
                if (next_page !== page_index)
                    set_page_index(next_page);

                let next_timestamp = timestamp;
                if (TIME_INTERVAL_STEPS[time_interval])
                    next_timestamp = get_next_timestamp(TIME_INTERVAL_STEPS[time_interval]) || timestamps[0];
                else if (time_interval === "shuffle")
                    next_timestamp = timestamps[(Math.random() * (timestamps.length - 1)).toFixed()];
                if (next_timestamp !== timestamp)
                    set_timestamp(next_timestamp);

                let next_channel = channel;
                if (channel_interval === "+")
                    next_channel = channels[(channels.indexOf(channel) + 1) % channels.length];
                else if (channel_interval === "-")
                    next_channel = channels[(channels.indexOf(channel) + channels.length - 1) % channels.length];
                else if (channel_interval === "shuffle")
                    next_channel = channels[(Math.random() * (channels.length - 1)).toFixed()];
                if (next_channel !== channel)
                    set_channel(next_channel);

            }, interval_sec);

        }
    }, [timeoutRef?.current, page_indices, timestamps, channels,
        get_next_page, get_next_timestamp, page_index, timestamp,
        playing, interval, page_interval, time_interval, channel_interval]);

    return (
        <div className={"slideshow"}>
            <div
                className={"header clickable" + (visible ? " visible" : "")}
                onClick={() => set_visible(!visible)}
            >
                <div>[slideshow]</div>
                <div>
                    <a
                        href={"https://github.com/defgsus/teletext-viewer"}
                        className={"github-link"}
                        target={"_blank"}
                    >
                        github.com/defgsus/teletext-viewer
                    </a>
                </div>
            </div>

            <div className={"slideshow-controls" + (visible ? "" : " hidden")}>
                <Button value={playing} set_value={set_playing}>
                    {playing ? "[#] stop" : "[>] play"}
                </Button>
                <div>
                    <DropdownValue
                        value={interval}
                        values={INTERVALS.map(i => i[0])}
                        set_value={set_interval}
                    /> interval
                </div>
                <div>
                    [<DropdownValue
                        value={page_interval}
                        values={PAGE_INTERVALS}
                        set_value={set_page_interval}
                    />] page
                </div>
                <div>
                    [<DropdownValue
                        value={time_interval}
                        values={TIME_INTERVALS}
                        set_value={set_time_interval}
                    />] timestamp
                </div>
                <div>
                    [<DropdownValue
                        value={channel_interval}
                        values={CHANNEL_INTERVALS}
                        set_value={set_channel_interval}
                    />] channel
                </div>
            </div>
        </div>
    );
};

export default SlideshowControls;
