import axios from "axios";
import { renderHook } from "@testing-library/react-hooks";
import useRawFile from "./useRawFile";
jest.mock("axios");

it("returns undefined by default, then loads raw data", async () => {
    const url = "foo";
    const data = "some raw data";
    axios.get.mockResolvedValue({ data });

    const { result, waitForNextUpdate } = renderHook(() => useRawFile(url));

    expect(result.current).toBe(undefined);

    await waitForNextUpdate();

    expect(result.current).toBe(data);
});
