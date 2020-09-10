import React from "react";
import { render } from "@testing-library/react";
import ManifestTemplateDownload from "./ManifestTemplateDownload";
import { InfoContext } from "../info/InfoProvider";

it("renders without crashing", () => {
    const { queryByText } = render(<ManifestTemplateDownload />);
    expect(
        queryByText(/download an empty manifest template/i)
    ).toBeInTheDocument();
});

it("shows a loader if the manifest list hasn't loaded", () => {
    const { queryByTestId } = render(<ManifestTemplateDownload />);
    expect(queryByTestId("loader")).toBeInTheDocument();
});

it("shows template download buttons if manifest list has loaded", () => {
    const { queryByText, queryByTestId } = render(
        <InfoContext.Provider
            value={{
                supportedTemplates: {
                    manifests: ["manifest type 1", "manifest type 2"],
                    assays: [],
                    analyses: []
                },
                extraDataTypes: []
            }}
        >
            <ManifestTemplateDownload />
        </InfoContext.Provider>
    );
    expect(queryByTestId("loader")).not.toBeInTheDocument();
    expect(queryByText(/manifest type 1/i)).toBeInTheDocument();
    expect(queryByText(/manifest type 2/i)).toBeInTheDocument();
});
