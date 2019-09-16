export function onValueChange(setState: (v: string | undefined) => void) {
    return (e: React.ChangeEvent<HTMLSelectElement>) =>
        setState(e.target.value);
}
