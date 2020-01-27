import { changeOption, filterFiles } from "../browseFilesUtil";
import { DataFile } from "../../../model/file";

const files: DataFile[] = [
    {
        id: 6,
        data_format: "MAF",
        upload_type: "WES",
        file_name: "dfci-9999.maf",
        artifact_category: "Assay from CIMAC",
        file_size_bytes: 1234567,
        trial: "DFCI-9999",
        uploaded_timestamp: new Date("2019-01-17T21:27:53.175496"),
        object_url: "DFCI-9999/dfci-9999.maf",
        download_link: "download_url"
    },
    {
        id: 1,
        data_format: "FASTQ",
        upload_type: "WES",
        file_name: "cimac-6521-001.fa",
        artifact_category: "Assay from CIMAC",
        file_size_bytes: 234,
        trial: "DFCI-1234",
        uploaded_timestamp: new Date("2019-01-17T21:27:53.175496"),
        object_url: "DFCI-1234/cimac-6521-001.fa",
        download_link: "download_url"
    },
    {
        id: 2,
        data_format: "FASTQ",
        upload_type: "WES",
        file_name: "cimac-6521-002.fa",
        artifact_category: "Assay from CIMAC",
        file_size_bytes: 21,
        trial: "DFCI-1234",
        uploaded_timestamp: new Date("2019-01-17T21:27:53.175496"),
        object_url: "DFCI-1234/cimac-6521-002.fa",
        download_link: "download_url",
        additional_metadata: {
            some_key: "some_value"
        }
    },
    {
        id: 3,
        data_format: "FASTQ",
        upload_type: "WES",
        file_name: "cimac-6521-003.fa",
        artifact_category: "Assay from CIMAC",
        file_size_bytes: 22345,
        trial: "DFCI-1234",
        uploaded_timestamp: new Date("2019-01-17T21:27:53.175496"),
        object_url: "DFCI-1234/cimac-6521-003.fa",
        download_link: "download_url",
        additional_metadata: {
            some_key: "other_value"
        }
    },
    {
        id: 4,
        data_format: "FASTQ",
        upload_type: "WES",
        file_name: "cimac-6521-004.fa",
        artifact_category: "Assay from CIMAC",
        file_size_bytes: 12345545,
        trial: "DFCI-1234",
        uploaded_timestamp: new Date("2019-01-17T21:27:53.175496"),
        object_url: "DFCI-1234/cimac-6521-004.fa",
        download_link: "download_url",
        additional_metadata: {
            other_key: "other_value"
        }
    },
    {
        id: 5,
        data_format: "VCF",
        upload_type: "WES",
        file_name: "cimac-6521.vcf",
        artifact_category: "Assay from CIMAC",
        file_size_bytes: 7654645,
        trial: "DFCI-9999",
        uploaded_timestamp: new Date("2019-01-17T21:27:53.175496"),
        object_url: "DFCI-9999/cimac-6521.vcf",
        download_link: "download_url",
        additional_metadata: {
            other_key: "some_other_value"
        }
    }
];

test("Returns the same file list if nothing is filtered", () => {
    expect(filterFiles(files, [], [], [], "")).toEqual(files);
});

test("Filters it correctly", () => {
    expect(
        filterFiles(
            files,
            ["DFCI-9999"],
            ["WES"],
            ["MAF", "VCF"],
            "dfci-9999.maf"
        )
    ).toEqual([files[0]]);

    expect(filterFiles(files, [], [], [], "dfci-9999.maf")).toEqual([files[0]]);

    expect(filterFiles(files, [], [], [], "some_value")).toEqual([files[2]]);

    expect(filterFiles(files, [], [], [], "some_key")).toEqual([
        files[2],
        files[3]
    ]);

    expect(filterFiles(files, [], [], [], "other_key")).toEqual([
        files[4],
        files[5]
    ]);

    // test space in search string as AND
    expect(
        filterFiles(files, [], [], [], "other_key some_other_value")
    ).toEqual([files[5]]);

    // AND between additional_metadata and filename
    expect(filterFiles(files, [], [], [], "other_key vcf")).toEqual([files[5]]);

    expect(
        filterFiles(files, [], [], [], "other_key some_other_value NONEXISTING")
    ).toEqual([]);
});

test("Adds option to options list if it's not there", () => {
    expect(changeOption(["DFCI-9999"], "DFCI-1234")).toEqual([
        "DFCI-9999",
        "DFCI-1234"
    ]);
});

test("Removes option from options list if it's already there", () => {
    expect(changeOption(["DFCI-9999", "DFCI-1234"], "DFCI-1234")).toEqual([
        "DFCI-9999"
    ]);
});
