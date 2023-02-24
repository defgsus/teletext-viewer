import TeletextViewer from "./viewer/TeletextViewer";


const App = () => {
    return (
        <div className={"app-wrapper"}>
            <TeletextViewer/>
            <div>
                <a
                    href={"https://github.com/defgsus/teletext-viewer"}
                    className={"github-link"}
                >
                    github.com/defgsus/teletext-viewer
                </a>
            </div>
        </div>
    );
}

export default App;
