

export const timestamp_str = (ts) => {
    if (!ts)
        return "";
    return ts.replaceAll("T", " ");
};