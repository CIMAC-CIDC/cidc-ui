import { render } from "@testing-library/react";
import React from "react";
import { AdditionalMetadataTable, CoreDetailsTable } from "./FileDetails";

test("CoreDetailsTable replaces missing values with N/A", () => {
    const { queryAllByText } = render(
        <CoreDetailsTable
            file={{ uploaded_timestamp: Date.now(), file_size_bytes: 1 }}
        />
    );
    expect(queryAllByText(/n\/a/i).length).toBe(4);
});

test("AdditionalMetadataTable renders metadata with expected formatting", () => {
    const { queryByText } = render(
        <AdditionalMetadataTable
            file={{
                additional_metadata: {
                    "assays.wes.assay_creator": "DFCI",
                    protocol_identifier: "10021",
                    // array for the sake of the test (unrealistic)
                    "wes.records.quality_flag": [1, 2, 3, 4]
                }
            }}
        />
    );

    // "assays" prefix removed from property names
    expect(queryByText(/assays\.wes\.assay_creator/i)).not.toBeInTheDocument();
    expect(queryByText(/wes\.assay_creator/i)).toBeInTheDocument();

    // arrays concatenated into a string
    expect(queryByText(/1, 2, 3, 4/i)).toBeInTheDocument();
});
