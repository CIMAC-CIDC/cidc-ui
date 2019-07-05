import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";
import * as dotenv from "dotenv";
import "./index.css";

dotenv.config();

// import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById("root") as HTMLElement);
//  registerServiceWorker();
