import * as React from "react";
import BrowseFilesPage from "./components/browseFiles/BrowseFilesPage";
import "./App.css";

class App extends React.Component {
    public render() {
        return (
            <div className="App">
                <BrowseFilesPage/>
            </div>
        );
    }
}

export default App;
