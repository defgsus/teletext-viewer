import {useEffect, useState} from "react";


const UrlHash = ({on_change}) => {
    const [current_hash, set_current_hash] = useState(window.location.hash);
    const [is_first_hash, set_is_first_hash] = useState(true);

    // url hash change
    const on_hash_change = (event) => {
        const hash = new URL(event.newURL).hash;
        set_current_hash(hash);
    };
    useEffect(() => {
        window.addEventListener('hashchange', on_hash_change);
    }, [window]);

    useEffect(() => {
        if (is_first_hash) {
            set_is_first_hash(false);
        }
        on_change(current_hash);
    }, [current_hash]);

    return null;
};

export default UrlHash;
