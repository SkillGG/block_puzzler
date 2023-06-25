type PropList = Record<string, string>;
type ChildArray = HTMLElement[];

export const $$ = (
    name: string = "div",
    props?: PropList,
    children?: ChildArray,
    innerHTML: string = ""
): HTMLElement => {
    if (!name) name = "div";
    const element = document.createElement(name);
    Object.entries(props || []).forEach((prop) => {
        element.setAttribute(prop[0], prop[1]);
    });
    children?.forEach((ch) => element.append(ch));
    element.innerHTML = innerHTML;
    return element;
};

export const $ =
    (strings: TemplateStringsArray) =>
    ({
        props: p,
        children: c,
        _html: h,
    }: { props?: PropList; children?: ChildArray; _html?: string } = {}) =>
        $$(strings[0], p, c, h);

export const getHTMLBoxes = (s: string[]) => {
    return s.map((q) => document.querySelector(q));
};
