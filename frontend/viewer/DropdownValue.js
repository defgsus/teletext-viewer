import {useEffect, useRef, useState} from "react";


const DropdownValue = ({value, values, set_value, render, compare, className, ...props}) => {

    const selected_ref = useRef();
    const [visible, set_visible] = useState(false);

    useEffect(() => {
        if (visible)
            selected_ref?.current?.scrollIntoView({
                behavior: "auto",
                block: "center",
            });
    }, [selected_ref?.current, visible]);

    if (!compare)
        compare = (a, b) => a === b;

    return (
        <div
            className={"dropdown" + (className ? ` ${className}` : "")}
            {...props}
        >
            <div
                className={"dropdown-box-background" + (visible ? "" : " hidden")}
                onClick={() => set_visible(false)}
            />
            <div className={"dropdown-box" + (visible ? "" : " hidden")}>
                {values.map((v, i) => (
                    <div
                        key={i}
                        className={"value" + (compare(value, v) ? "" : " lesser")}
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
