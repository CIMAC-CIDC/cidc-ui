declare module "react-shadow" {
    import { ReactNode, ComponentType } from "react";

    type RenderElement = keyof HTMLElementTagNameMap;

    type Root = {
        [name in RenderElement]: ComponentType<any>;
    };

    const root: Root;

    export default root;
}
