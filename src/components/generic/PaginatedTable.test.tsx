import { fireEvent, render } from "@testing-library/react";
import { cleanup } from "@testing-library/react-hooks";
import React from "react";
import PaginatedTable, {
    IHeader,
    IPaginatedTableProps
} from "./PaginatedTable";

interface IDataType {
    id: number;
    a: number;
    b: string;
}

const data: IDataType[] = [
    { id: 0, a: 1, b: "foo" },
    { id: 1, a: 2, b: "bar" },
    { id: 2, a: 3, b: "buzz" }
];

const renderPaginatedTable = (
    props?: Partial<IPaginatedTableProps<IDataType>>
) => {
    const defaultProps = {
        count: 0,
        page: 0,
        rowsPerPage: 3,
        getRowKey: r => r.id,
        onChangePage: jest.fn()
    };
    const { rerender, ...res } = render(
        <PaginatedTable<IDataType>
            {...{
                ...defaultProps,
                ...(props || {})
            }}
        />
    );

    return {
        ...res,
        rerender: (p?: Partial<IPaginatedTableProps<IDataType>>) =>
            rerender(
                <PaginatedTable<IDataType>
                    {...{
                        ...defaultProps,
                        ...(p || {})
                    }}
                />
            )
    };
};

it("shows a placeholder if data is undefined", () => {
    const { queryAllByTestId } = renderPaginatedTable();
    expect(queryAllByTestId(/placeholder-row/i).length).toBeGreaterThan(0);
});

it("shows an appropriate message if data is empty", () => {
    const { queryByText } = renderPaginatedTable({ data: [] });
    expect(queryByText(/no data found/i)).toBeInTheDocument();
});

it("renders data with default settings", () => {
    const { queryByText } = renderPaginatedTable({ data });
    expect(queryByText(/foo/i)).toBeInTheDocument();
    expect(queryByText(/bar/i)).toBeInTheDocument();
    expect(queryByText(/buzz/i)).toBeInTheDocument();
});

it("fires an event on row clicks", () => {
    const onClickRow = jest.fn();
    const { getByText } = renderPaginatedTable({ data, onClickRow });
    fireEvent.click(getByText(/foo/i));
    expect(onClickRow).toHaveBeenCalledWith(data[0]);
});

const headers: IHeader[] = [
    { label: "Cool Column", key: "a", disableSort: true },
    {
        label: "Square Column",
        key: "b",
        format: (v: string) => `${v} with format`
    }
];

it("renders headers based on header configs", () => {
    const onClickHeader = jest.fn();
    const { queryByText, getByText } = renderPaginatedTable({
        headers,
        data,
        onClickHeader
    });

    // header labels rendered
    expect(queryByText(/cool column/i)).toBeInTheDocument();
    expect(queryByText(/square column/i)).toBeInTheDocument();

    // value formatting
    expect(queryByText(/foo with format/i)).toBeInTheDocument();

    // sorting interactions
    fireEvent.click(getByText(/cool column/i));
    expect(onClickHeader).not.toHaveBeenCalled();
    fireEvent.click(getByText(/square column/i));
    expect(onClickHeader).toHaveBeenCalledWith(headers[1]);
});

test("selection checkboxes behave as expected", () => {
    const setSelectedRowIds = jest.fn();
    const { getByTestId, rerender } = renderPaginatedTable({
        data,
        headers,
        selectedRowIds: [1],
        setSelectedRowIds
    });

    // Row with id 1 renders checked
    const row1Checkbox = getByTestId(/select 1/i).querySelector(
        'input[type="checkbox"]'
    );
    expect(row1Checkbox).toHaveProperty("checked", true);

    // Select all
    fireEvent.click(
        getByTestId(/select all/i).querySelector('input[type="checkbox"]')!
    );
    expect(setSelectedRowIds).toHaveBeenCalledWith([0, 1, 2]);

    // Deselect all
    rerender({ data, headers, selectedRowIds: [0, 1, 2], setSelectedRowIds });
    fireEvent.click(
        getByTestId(/select all/i).querySelector('input[type="checkbox"]')!
    );
    expect(setSelectedRowIds).toHaveBeenCalledWith([]);
});
