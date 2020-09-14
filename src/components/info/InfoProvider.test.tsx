import React from "react";
import { render } from "@testing-library/react";
import InfoProvider, { InfoContext } from "./InfoProvider";
import {
    getSupportedAssays,
    getSupportedAnalyses,
    getSupportedManifests,
    getExtraDataTypes
} from "../../api/api";
jest.mock("../../api/api");

const assays = ["wes", "rna", "olink"];
getSupportedAssays.mockResolvedValue(assays);
const analyses = ["wes_analysis", "rna_analysis"];
getSupportedAnalyses.mockResolvedValue(analyses);
const manifests = ["pbmc", "plasma"];
getSupportedManifests.mockResolvedValue(manifests);
const extraDataTypes = ["tumor_normal_pairing"];
getExtraDataTypes.mockResolvedValue(extraDataTypes);

const dataQuery = (
    findByText: (q: RegExp) => Promise<HTMLElement>,
    data: any
) => {
    const re = new RegExp(JSON.stringify(data), "i");
    return findByText(re);
};

const TestInfoConsumer: React.FC = () => {
    const info = React.useContext(InfoContext);
    return <div>{JSON.stringify(info)}</div>;
};

it("provides info if all api info requests succeed", async () => {
    const { findByText } = render(
        <InfoProvider>
            <TestInfoConsumer />
        </InfoProvider>
    );
    expect(await dataQuery(findByText, assays)).toBeInTheDocument();
    expect(await dataQuery(findByText, manifests)).toBeInTheDocument();
    expect(await dataQuery(findByText, analyses)).toBeInTheDocument();
    expect(await dataQuery(findByText, extraDataTypes)).toBeInTheDocument();
});
