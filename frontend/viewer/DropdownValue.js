import {useEffect, useRef, useState} from "react";


const DropdownValue = ({value, values, set_value, render, ...props}) => {

    const selected_ref = useRef();
    const [visible, set_visible] = useState(false);

    useEffect(() => {
        if (visible)
            selected_ref?.current?.scrollIntoView({
                behavior: "auto",
                block: "center",
            });
    }, [selected_ref?.current, visible]);

    return (
        <div
            className={"dropdown"}
        >
            <div className={"dropdown-box" + (visible ? "" : " hidden")}>
                {values.map((v, i) => (
                    <div
                        key={i}
                        className={"value" + (v === value ? "" : " lesser")}
                        ref={v === value ? selected_ref : null}
                        onClick={() => {
                            set_value(v);
                            set_visible(false);
                        }}
                    >
                        {render ? render(v) : v}
                    </div>
                ))}
            </div>
            <div
                className={"value"}
                onClick={() => set_visible(!visible)}
            >
                {render ? render(value) : value}
            </div>
        </div>
    );
};

export default DropdownValue;
