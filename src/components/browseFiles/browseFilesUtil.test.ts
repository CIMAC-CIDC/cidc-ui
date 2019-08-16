import { changeOption, filterFiles } from "./browseFilesUtil";

const files = [
    {
        id: "1",
        file_type: "FASTQ",
        assay_category: "WES",
        file_name: "cimac-6521-001.fa",
        number_of_samples: 1,
        file_size_bytes: 234,
        trialid: "DFCI-1234",
        uploaded_timestamp: "2019-01-17T21:27:53.175496",
        object_url: "test_uri",
        download_link: "download_url",
        fastq_properties: null
    },
    {
        id: "2",
        file_type: "FASTQ",
        assay_category: "WES",
        file_name: "cimac-6521-002.fa",
        number_of_samples: 1,
        file_size_bytes: 21,
        trialid: "DFCI-1234",
        uploaded_timestamp: "2019-01-17T21:27:53.175496",
        object_url: "test_uri",
        download_link: "download_url",
        fastq_properties: null
    },
    {
        id: "3",
        file_type: "FASTQ",
        assay_category: "WES",
        file_name: "cimac-6521-003.fa",
        number_of_samples: 1,
        file_size_bytes: 22345,
        trialid: "DFCI-1234",
        uploaded_timestamp: "2019-01-17T21:27:53.175496",
        object_url: "test_uri",
        download_link: "download_url",
        fastq_properties: null
    },
    {
        id: "4",
        file_type: "FASTQ",
        assay_category: "WES",
        file_name: "cimac-6521-004.fa",
        number_of_samples: 1,
        file_size_bytes: 12345545,
        trialid: "DFCI-1234",
        uploaded_timestamp: "2019-01-17T21:27:53.175496",
        object_url: "test_uri",
        download_link: "download_url",
        fastq_properties: null
    },
    {
        id: "5",
        file_type: "VCF",
        assay_category: "WES",
        file_name: "cimac-6521.vcf",
        number_of_samples: 1,
        file_size_bytes: 7654645,
        trialid: "DFCI-9999",
        uploaded_timestamp: "2019-01-17T21:27:53.175496",
        object_url: "test_uri",
        download_link: "download_url",
        fastq_properties: null
    },
    {
        id: "6",
        file_type: "MAF",
        assay_category: "WES",
        file_name: "dfci-9999.maf",
        number_of_samples: 276,
        file_size_bytes: 1234567,
        trialid: "DFCI-9999",
        uploaded_timestamp: "2019-01-17T21:27:53.175496",
        object_url: "test_uri",
        download_link: "download_url",
        fastq_properties: null
    }
];

test("Returns the same file list if nothing is filtered", () => {
    expect(filterFiles(files, [], [], [], "")).toEqual(files);
});

test("Filters it correctly", () => {
    expect(
        filterFiles(files, ["DFCI-9999"], ["WES"], ["MAF", "VCF"], "dfci")
    ).toEqual([
        {
            id: "6",
            file_type: "MAF",
            assay_category: "WES",
            file_name: "dfci-9999.maf",
            number_of_samples: 276,
            file_size_bytes: 1234567,
            trialid: "DFCI-9999",
            uploaded_timestamp: "2019-01-17T21:27:53.175496",
            object_url: "test_uri",
            download_link: "download_url",
            fastq_properties: null
        }
    ]);
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
