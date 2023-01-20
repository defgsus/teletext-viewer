

const Timestamp = ({timestamp, ...props}) => {
    return (
        <span {...props}>
            {timestamp ? timestamp.replace("T", " ") : "?"}
        </span>
    );
};

export default Timestamp;
