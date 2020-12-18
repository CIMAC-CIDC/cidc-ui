import React from "react";
import InfoProvider, { InfoContext } from "./InfoProvider";
import { apiFetch } from "../../api/api";
import { renderWithSWR } from "../../../test/helpers";
jest.mock("../../api/api");

const assays = ["wes", "rna", "olink"];
const analyses = ["wes_analysis", "rna_analysis"];
const manifests = ["pbmc", "plasma"];
const extraDataTypes = ["tumor_normal_pairing"];
apiFetch.mockImplementation(async (url: string) => {
    switch (url) {
        case "/info/assays":
            return assays;
        case "/info/analyses":
            return analyses;
        case "/info/manifests":
            return manifests;
        case "/info/extra_data_types":
            return extraDataTypes;
        default:
            throw new Error("shouldn't reach this code");
    }
});

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
    const { findByText } = renderWithSWR(
        <InfoProvider>
            <TestInfoConsumer />
        </InfoProvider>
    );
    expect(await dataQuery(findByText, assays)).toBeInTheDocument();
    expect(await dataQuery(findByText, manifests)).toBeInTheDocument();
    expect(await dataQuery(findByText, analyses)).toBeInTheDocument();
    expect(await dataQuery(findByText, extraDataTypes)).toBeInTheDocument();
});
