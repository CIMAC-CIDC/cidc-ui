import { filterFiles, changeOption } from "./BrowseFilesUtil";

const files = [
    {
        "name": "cimac-6521-001.fa",
        "trialId": "DFCI-1234",
        "experimentalStrategy": "WES",
        "numberOfCases": 1,
        "dataFormat": "FASTQ",
        "size": 234
    },
    {
        "name": "cimac-6521-002.fa",
        "trialId": "DFCI-1234",
        "experimentalStrategy": "WES",
        "numberOfCases": 1,
        "dataFormat": "FASTQ",
        "size": 21
    },
    {
        "name": "cimac-6521-003.fa",
        "trialId": "DFCI-1234",
        "experimentalStrategy": "WES",
        "numberOfCases": 1,
        "dataFormat": "FASTQ",
        "size": 22345
    },
    {
        "name": "cimac-6521-004.fa",
        "trialId": "DFCI-1234",
        "experimentalStrategy": "WES",
        "numberOfCases": 1,
        "dataFormat": "FASTQ",
        "size": 12345545
    },
    {
        "name": "cimac-6521.vcf",
        "trialId": "DFCI-9999",
        "experimentalStrategy": "WES",
        "numberOfCases": 1,
        "dataFormat": "VCF",
        "size": 7654645
    },
    {
        "name": "dfci-9999.maf",
        "trialId": "DFCI-9999",
        "experimentalStrategy": "WES",
        "numberOfCases": 276,
        "dataFormat": "MAF",
        "size": 1234567
    }
]


test("Returns the same file list if nothing is filtered", () => {

    expect(filterFiles(files, [], [], [], "")).toEqual(files);
});
